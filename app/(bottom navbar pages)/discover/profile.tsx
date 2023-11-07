"use client";
import { differenceInYears, parse, format, parseISO } from "date-fns";
import Image from "next/image";
import Cross from "@/public/cross.svg";
import Cake from "@/public/cake.svg";
import Undo from "@/public/undo.svg";
import MapPin from "@/public/map-pin.svg";
import BadgeIcon from "@/public/badge-check.svg";
import { useLayoutEffect, useRef, useState } from "react";
import gsap, { Power2 } from "gsap";
import { SkipProfileBtn } from "@/components/skip-profile-btn";
import { Prompt } from "@/components/prompt";
import { LikeDialog } from "@/components/like-dialog";
import { usePathname } from "next/navigation";
import { MatchDialog } from "@/components/match-btn";
import { Filter } from "@/components/filter";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface IProfile {
  serverProfiles: FullProfile[];
  authedProfile?: {
    gender: string;
    skipped_profiles: string[];
    onboarded: boolean;
  };
  userId: string;
  likeData: { like: PhotoLike | PromptLike; type: string } | null;
}

export function Profile({
  serverProfiles,
  userId,
  authedProfile,
  likeData,
}: IProfile) {
  const profileRef = useRef(null);
  const [imgLoading, setImgLoading] = useState(true);
  const [profiles, setProfiles] = useState<FullProfile[]>(serverProfiles);
  const [skippedProfile, setSkippedProfile] = useState<FullProfile | null>(
    null,
  );
  // console.log('skippedProfile :', skippedProfile);

  // const currentSearchParams = useMemo<{ [key: string]: string }>(() => {
  //   const params: { [key: string]: string } = {};
  //   searchParams.forEach((value, key) => {
  //     params[key] = value;
  //   });
  //   return params;
  // }, [searchParams]);

  const pathname = usePathname();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        profileRef.current,
        {
          y: "20%",
          autoAlpha: 0,
          duration: 1,
          ease: Power2.easeInOut,
        },
        {
          autoAlpha: 1,
          y: 0,
        },
      );
    }, profileRef);

    return () => ctx.revert();
  }, [profiles]);
  // console.log('serverProfiles :', profiles);

  // Function to skip a profile
  function skipProfile() {
    // Remove the last profile from the profiles array.
    const profilesCp = [...profiles];
    const profileToSkip = profilesCp.pop();
    setProfiles(profilesCp);
    if (profileToSkip) {
      setSkippedProfile(profileToSkip);
    }
  }

  function undoSkip() {
    if (skippedProfile) {
      setProfiles((prev) => [...prev, skippedProfile]);
      setSkippedProfile(null);
    }
  }
  const profile = profiles.at(-1)!;
  if (!profiles || !profile) {
    window.location.reload();
    return null;
  }
  const dob = format(parseISO(String(profile.date_of_birth)), "yyyy/MM/dd");
  const date = parse(dob, "yyyy/MM/dd", new Date());
  const age = differenceInYears(new Date(), date);

  const {
    question: question0,
    answer: answer0,
    id: promptId0,
  } = profile.prompts[0] || "";
  const {
    question: question1,
    answer: answer1,
    id: promptId1,
  } = profile.prompts[1] || "";
  const {
    question: question2,
    answer: answer2,
    id: promptId2,
  } = profile.prompts[2] || "";

  const { src: src0, id: photoId0 } = profile.photos[0] || "";
  const { src: src1, id: photoId1 } = profile.photos[1] || "";
  const { src: src2, id: photoId2 } = profile.photos[2] || "";
  const { src: src3, id: photoId3 } = profile.photos[3] || "";
  const { src: src4, id: photoId4 } = profile.photos[4] || "";
  const { src: src5, id: photoId5 } = profile.photos[5] || "";
  const photo = (src: string | null, id: string) => {
    if (!src) {
      return null;
    } else {
      return (
        <div className={"relative w-fit"}>
          <Image
            priority
            src={
              src ||
              "https://beasnruicmydtdgqozev.supabase.co/storage/v1/object/public/photos/5b16fe18-c7dc-46e6-82d1-04c5900504e4/jEudzBHSsYg.jpg"
            }
            height={500}
            width={400}
            alt="me"
            className={cn(
              "rounded-lg duration-700 ease-in-out",
              imgLoading
                ? "scale-90 blur-lg grayscale"
                : "scale-100 blur-0 grayscale-0",
            )}
            onLoad={async () => {
              setImgLoading(false);
            }}
          />
          {pathname === "/discover" && (
            <LikeDialog
              itemId={id}
              type="photo"
              liker={userId}
              likee={profile.id}
              src={src}
              firstName={profile.first_name}
              question={null}
              answer={null}
            />
          )}
        </div>
      );
    }
  };

  // console.log('userId :', userId);
  // console.log('profile.id :', profile?.id);
  const prompt = (question: string, answer: string, id: string) => {
    if (!question) {
      return null;
    } else {
      return (
        <Prompt
          liker={userId}
          likee={profile.id}
          question={question}
          answer={answer}
          id={id}
        />
      );
    }
  };

  return (
    <main
      ref={profileRef}
      className="flex min-h-screen flex-col space-y-4 p-4 opacity-0 md:items-center"
    >
      <div className="flex items-center justify-between md:w-[500px]">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold capitalize md:self-start">
            {profile.first_name}
          </h1>
          {!profile.verified && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <BadgeIcon
                    className="inline-block  text-white"
                    width={32}
                    height={32}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-secondary-foreground">
                  <p>Верифікований акаунт</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {!pathname.includes("likes") && (
          <div className="flex items-center gap-2">
            <Button
              disabled={!skippedProfile}
              variant="ghost"
              size="icon"
              onClick={() => undoSkip()}
            >
              <Undo />
            </Button>
            <Filter userId={userId} />
          </div>
        )}
      </div>
      <SkipProfileBtn
        likeData={likeData}
        userId={userId}
        profileId={profile.id}
        skipProfile={skipProfile}
      />
      {pathname.includes("likes") && (
        <MatchDialog
          likee={profile.id}
          liker={userId}
          src={profile.photos[0].src}
          firstName={profile.first_name}
          likeData={likeData}
        />
      )}

      {photo(src0, photoId0)}

      {prompt(question0, answer0, promptId0)}

      {/*       
      ----- INFO 
      */}

      <div className="relative rounded-lg bg-secondary/75 px-4 py-10 font-bold md:w-[500px]">
        <div className="flex items-center justify-around gap-6 text-secondary-foreground">
          <div className="flex items-center gap-3">
            <Cake />
            {age || "17"}
          </div>
          <div className="flex items-center gap-3">
            <Cross />
            {profile.denomination}
          </div>
          <div className="flex items-center gap-3">
            <MapPin />
            {profile.toponym}
          </div>
        </div>
      </div>

      {/*       
      ----- PHOTO1
      */}

      {photo(src1, photoId1)}

      {/*       
      ----- PHOTO2
      */}

      {photo(src2, photoId2)}

      {prompt(question1, answer1, promptId1)}

      {/*       
      ----- PHOTO3
      */}

      {photo(src3, photoId3)}

      {prompt(question2, answer2, promptId2)}

      {/*       
      ----- PHOTO4
      */}

      {photo(src4, photoId4)}
      {/*       
      ----- PHOTO5
      */}

      {photo(src5, photoId5)}
      <div className="pb-20"></div>
    </main>
  );
}
