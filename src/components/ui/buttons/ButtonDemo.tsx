import React from "react";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import SpecialButton from "./SpecialButton";
import EventButton from "./EventButton";
import CommonButton from "./CommonButton";

export default function ButtonDemo() {
  return (
    <div className="p-8 bg-slate-900 min-h-screen flex flex-col items-center gap-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        Button Components Demo
      </h1>

      <div className="flex flex-col gap-4 items-center w-full max-w-md">
        <div className="w-full p-4 border border-white/10 rounded-xl flex flex-col gap-2 items-center">
          <h2 className="text-white/50 text-sm uppercase tracking-widest mb-2">
            Primary
          </h2>
          <PrimaryButton onClick={() => console.log("Primary Clicked")}>
            Start Game
          </PrimaryButton>
        </div>

        <div className="w-full p-4 border border-white/10 rounded-xl flex flex-col gap-2 items-center">
          <h2 className="text-white/50 text-sm uppercase tracking-widest mb-2">
            Secondary
          </h2>
          <SecondaryButton onClick={() => console.log("Secondary Clicked")}>
            Settings
          </SecondaryButton>
        </div>

        <div className="w-full p-4 border border-white/10 rounded-xl flex flex-col gap-2 items-center">
          <h2 className="text-white/50 text-sm uppercase tracking-widest mb-2">
            Special
          </h2>
          <SpecialButton onClick={() => console.log("Special Clicked")}>
            Summon x10
          </SpecialButton>
        </div>

        <div className="w-full p-4 border border-white/10 rounded-xl flex flex-col gap-2 items-center">
          <h2 className="text-white/50 text-sm uppercase tracking-widest mb-2">
            Event
          </h2>
          <EventButton onClick={() => console.log("Event Clicked")}>
            Limited Time
          </EventButton>
        </div>

        <div className="w-full p-4 border border-white/10 rounded-xl flex flex-col gap-2 items-center">
          <h2 className="text-white/50 text-sm uppercase tracking-widest mb-2">
            Common
          </h2>
          <CommonButton onClick={() => console.log("Common Clicked")}>
            Cancel
          </CommonButton>
        </div>
      </div>
    </div>
  );
}
