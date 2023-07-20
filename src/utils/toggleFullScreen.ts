import { z } from "zod";

export const toggleFullScreen = () => {
  const navigatorKeyboard = canLock(navigator) ? navigator.keyboard : null;

  if (document.fullscreenElement) {
    navigatorKeyboard?.unlock();
    document.exitFullscreen();
  } else {
    navigatorKeyboard?.lock(["Escape"]);
    document.documentElement.requestFullscreen();
  }
};

interface NavigatorKeyboard {
  lock(keyCodes: string[]): Promise<void>;
  unlock(): void;
}

interface NavigatorWithKeyboard extends Navigator {
  keyboard: NavigatorKeyboard;
}

const navigatorWithKeyboardValidator = z.object({
  keyboard: z.object({
    lock: z.function(),
    unlock: z.function(),
  }),
});

const canLock = (navigator: Navigator): navigator is NavigatorWithKeyboard => {
  return navigatorWithKeyboardValidator.safeParse(navigator).success;
};
