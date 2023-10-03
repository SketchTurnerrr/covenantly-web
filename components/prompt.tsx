'use client';
import { LikeDialog } from './like-dialog';

interface IPrompt {
  question: string | null;
  answer: string | null;
  id: string;
  discover: boolean;
  liker: string;
  likee: string;
}

export function Prompt({
  question,
  answer,
  id,
  liker,
  likee,
  discover = false,
}: IPrompt) {
  return (
    <div className='px-4  py-10 bg-purple-50  relative rounded-lg space-y-4'>
      <p className='text-md font-semibold'>{question}</p>
      <h2 className='text-4xl font-bold'>{answer}</h2>
      {discover && (
        <LikeDialog
          itemId={id}
          type='prompt'
          liker={liker}
          likee={likee}
          firstName={null}
          src={null}
          question={question}
          answer={answer}
        />
      )}
    </div>
  );
}
