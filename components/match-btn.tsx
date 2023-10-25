"use client";

import { Button } from "./ui/button";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import HandIcon from "@/public/hand-waving.svg";
import {
  LDialog,
  LDialogContent,
  LDialogHeader,
  LDialogTitle,
  LDialogTrigger,
} from "@/components/ui/custom-like-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import Image from "next/image";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Prompt } from "./prompt";

interface IMatchDialog {
  liker: string;
  likee: string;
  firstName: string | null;
  src: string;
  likeData: PhotoLike | PromptLike | undefined;
}

const FormSchema = z.object({
  comment: z.string(),
});

export function MatchDialog({
  liker,
  likee,
  firstName,
  src,
  likeData,
}: IMatchDialog) {
  const supabase = createClientComponentClient<Database>();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const btnRef = useRef(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      comment: "",
    },
  });

  const handleMatch = async (data: z.infer<typeof FormSchema>) => {
    const { comment } = data;

    const { data: conversation, error } = await supabase
      .from("conversations")
      .insert({
        participant1: liker,
        participant2: likee,
      })
      .returns<ConversationsType>()
      .select()
      .single();

    if (comment && conversation) {
      const { error: mError } = await supabase.from("messages").insert({
        content: comment,
        conversation_id: conversation.id,
        sender_id: liker,
      });
      console.log("mError :", mError);
    }

    console.log("error match:", error);
    setOpen(false);
    router.push("/matches");
  };

  if (!likeData) {
    return; // TODO
  }

  return (
    <LDialog open={open} onOpenChange={setOpen}>
      <LDialogTrigger className="" asChild>
        <div className="sticky left-4 top-[86%] z-30 h-0 self-end">
          <Button
            size="icon"
            className=" h-12 w-12 rounded-full bg-white text-3xl"
          >
            <HandIcon />
          </Button>
        </div>
      </LDialogTrigger>
      <LDialogContent className="max-w-xs border-none bg-transparent shadow-none md:min-w-[350px]">
        <LDialogHeader>
          <LDialogTitle className="text-3xl">
            {firstName ? firstName : ""}
          </LDialogTitle>
        </LDialogHeader>
        <div className="flex flex-col gap-8">
          {"photo" in likeData && (
            <div className="relative h-80">
              <Image
                src={likeData?.photo?.src}
                alt={firstName!}
                layout="fill"
                className="aspect-square rounded-lg object-cover"
              />
              <div className="absolute -bottom-4 w-fit rounded-lg rounded-bl-none bg-purple-400 p-2 text-sm font-semibold text-white">
                {likeData.comment
                  ? likeData.comment
                  : likeData.liker.gender === "male"
                  ? "Вподобав" + " ваше фото"
                  : "Вподобала" + " ваше фото"}
              </div>
            </div>
          )}

          {"prompt" in likeData && (
            <div className="relative">
              <Prompt
                likee=""
                liker=""
                id={likeData.id}
                question={likeData.prompt.question}
                answer={likeData.prompt.answer}
              />
              <div className="absolute -bottom-4 w-fit rounded-lg rounded-bl-none bg-purple-400 p-2 text-sm font-semibold text-white">
                {likeData.comment
                  ? likeData.comment
                  : likeData.liker.gender === "male"
                  ? "Вподобав" + " вашу відповідь"
                  : "Вподобала" + " вашу відповідь"}
              </div>
            </div>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleMatch)}
              className="flex flex-col gap-2"
            >
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-white"
                        maxLength={140}
                        placeholder="Відправити повідомлення"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="text-base font-bold"
                type="submit"
                // onClick={handleLike}
              >
                Познайомитись
              </Button>
            </form>
          </Form>
        </div>
      </LDialogContent>
    </LDialog>
  );
}
