import type { Metadata } from "next";
import "./globals.css";
import ConsoleFilter from "./ConsoleFilter";

export const metadata: Metadata = {
  title: "WebFastTry - Test Pages",
  description: "Internal testing pages for engineers and external users",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  var p = ["Could not establish connection", "Receiving end does not exist"];
  function ok(msg) { return p.some(function(s) { return (msg || "").indexOf(s) !== -1; }); }
  var e = console.error;
  console.error = function() {
    var m = (arguments[0] && (typeof arguments[0] === "string" ? arguments[0] : arguments[0].message)) || "";
    if (ok(m)) return;
    return e.apply(console, arguments);
  };
  window.addEventListener("unhandledrejection", function(ev) {
    var m = (ev.reason && ev.reason.message) || (typeof ev.reason === "string" ? ev.reason : "") || "";
    if (ok(m)) { ev.preventDefault(); ev.stopPropagation(); }
  });
})();
            `.trim(),
          }}
        />
      </head>
      <body className="antialiased">
        <ConsoleFilter />
        {children}
      </body>
    </html>
  );
}

