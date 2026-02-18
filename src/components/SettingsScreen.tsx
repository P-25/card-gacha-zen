import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { toggleBgmMute, toggleSfxMute } from "@/store/slices/settingsSlice";
import { useSound } from "@/hooks/useSound";

interface SettingsScreenProps {
  onBack?: () => void;
}

// Ensure useSound is imported if not already, or pass it down?
// But Toggle is defined in the same file, so we need to add import at top.

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const dispatch = useDispatch();
  const { isBgmMuted, isSfxMuted } = useSelector(
    (state: RootState) => state.settings,
  );

  return (
    <div className="flex flex-col h-full bg-[#f0f4f8] relative overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-4 pt-4 shadow-sm relative z-10 flex items-center justify-center">
        <h1 className="text-xl font-black text-[#1a2e2e] uppercase tracking-wider relative">
          Settings
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#d0dbe5] rounded-full" />
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Sound Section */}
        <section>
          <h2 className="text-[#1a2e2e] font-bold text-lg mb-4">Sound</h2>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            {/* BGM Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[#8da2b3]">
                  {isBgmMuted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-volume-x"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="23" x2="17" y1="9" y2="15" />
                      <line x1="17" x2="23" y1="9" y2="15" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-volume-2"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  )}
                </span>
                <span className="text-[#8da2b3] font-medium text-sm">
                  Background music
                </span>
              </div>
              <Toggle
                checked={!isBgmMuted}
                onChange={() => dispatch(toggleBgmMute())}
              />
            </div>

            {/* SFX Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[#8da2b3]">
                  {isSfxMuted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-volume-x"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="23" x2="17" y1="9" y2="15" />
                      <line x1="17" x2="23" y1="9" y2="15" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-volume-2"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  )}
                </span>
                <span className="text-[#8da2b3] font-medium text-sm">
                  Sound effects
                </span>
              </div>
              <Toggle
                checked={!isSfxMuted}
                onChange={() => dispatch(toggleSfxMute())}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  const { playClick } = useSound();
  return (
    <motion.button
      onClick={() => {
        playClick();
        onChange();
      }}
      className={`w-14 h-8 rounded-full p-1 transition-colors ${
        checked ? "bg-[#4a8cdb]" : "bg-gray-200"
      }`}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-6 h-6 bg-white rounded-full shadow-md"
        animate={{ x: checked ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}
