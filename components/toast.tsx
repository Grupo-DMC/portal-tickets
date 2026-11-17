"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Icon } from "./icons";

const Ctx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState("");
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  const aviso = useCallback((m: string) => {
    setMsg(m);
    clearTimeout(t.current);
    t.current = setTimeout(() => setMsg(""), 2600);
  }, []);
  useEffect(() => () => clearTimeout(t.current), []);
  return (
    <Ctx.Provider value={aviso}>
      {children}
      {msg && (
        <div role="status" className="fixed right-[22px] bottom-[22px] z-[60] flex items-center gap-2.5 rounded-[10px] bg-surface px-[15px] py-[11px] text-[13px] shadow-[0_0_0_1px_#595d6c,0_16px_40px_rgba(0,0,0,.6)]">
          <Icon name="check" size={17} className="text-[#a8dcbd]" />
          {msg}
        </div>
      )}
    </Ctx.Provider>
  );
}
