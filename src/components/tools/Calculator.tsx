"use client";

import { useState } from "react";

// Enkel kalkylator utan eval: räknar med vänster-till-höger och respekterar × ÷ före + −.
function evaluate(expr: string): string {
  const tokens = expr.match(/\d+(?:,\d+)?|[+\-×÷]/g);
  if (!tokens) return "";
  const nums: number[] = [];
  const ops: string[] = [];
  let expectNum = true;
  let neg = false;
  for (const t of tokens) {
    if (expectNum) {
      if (t === "-") {
        neg = !neg;
        continue;
      }
      if (!/\d/.test(t)) return "Fel";
      nums.push((neg ? -1 : 1) * parseFloat(t.replace(",", ".")));
      neg = false;
      expectNum = false;
    } else {
      ops.push(t);
      expectNum = true;
    }
  }
  if (expectNum) return "Fel";
  // × och ÷ först
  for (let i = 0; i < ops.length; ) {
    if (ops[i] === "×" || ops[i] === "÷") {
      if (ops[i] === "÷" && nums[i + 1] === 0) return "Kan inte dela med 0";
      const r = ops[i] === "×" ? nums[i] * nums[i + 1] : nums[i] / nums[i + 1];
      nums.splice(i, 2, r);
      ops.splice(i, 1);
    } else i++;
  }
  let res = nums[0];
  ops.forEach((o, i) => (res = o === "+" ? res + nums[i + 1] : res - nums[i + 1]));
  return String(Math.round(res * 1e8) / 1e8).replace(".", ",");
}

const KEYS = ["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ",", "=", "+"];

export default function Calculator() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("");

  const press = (k: string) => {
    if (k === "=") return setResult(evaluate(expr.replace(/−/g, "-")));
    setResult("");
    setExpr((e) => e + (k === "−" ? "-" : k));
  };

  return (
    <div className="w-64">
      <div className="mb-2 rounded-xl bg-navy p-3 text-right font-mono text-white">
        <div className="min-h-5 truncate text-sm text-white/70">{expr.replace(/-/g, "−") || "0"}</div>
        <div className="min-h-8 text-2xl">{result}</div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        <button className="col-span-2 rounded-lg bg-wine/10 py-2 font-semibold text-wine" onClick={() => (setExpr(""), setResult(""))}>
          Rensa
        </button>
        <button className="col-span-2 rounded-lg bg-line py-2 font-semibold" onClick={() => setExpr((e) => e.slice(0, -1))}>
          ⌫
        </button>
        {KEYS.map((k) => (
          <button
            key={k}
            onClick={() => press(k)}
            className={`rounded-lg py-2.5 text-lg font-semibold ${k === "=" ? "bg-gold text-navy" : /[÷×−+]/.test(k) ? "bg-navy/10 text-navy" : "bg-cream"} hover:brightness-95`}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
