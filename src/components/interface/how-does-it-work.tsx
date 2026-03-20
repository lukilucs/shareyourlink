import React from "react";

const HowDoesItWork = () => {
  return (
    <section className="py-10 md:py-12">
      <div className="mx-auto w-4/5 border-t-2 border-primary pb-8"></div>
      <div className="container mx-auto px-6 max-w-6xl space-y-8 md:space-y-10">
        <div className="flex items-center gap-6 border-b-4 border-primary pb-4">
          <span className="bg-primary text-primary-foreground text-4xl font-black px-4 py-2 rotate-3">
            ?
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
            How does it work
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          <div className="relative group">
            <span className="text-6xl md:text-8xl font-black text-primary/10 absolute -top-4.5 md:-top-10 -left-1 z-0 group-hover:text-primary/20 transition-colors">
              CREATE LINK
            </span>
            <div className="relative z-10 space-y-4">
              <h3 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
                CREATE LINK
              </h3>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                Paste your link, you will get a{" "}
                <span className="text-primary font-semibold underline decoration-2">
                  unique code
                </span>{" "}
                that you can share with others. Easy and fast, no bullshit.
              </p>
            </div>
          </div>

          <div className="relative group">
            <span className="text-6xl md:text-8xl font-black text-primary/10 absolute -top-4.5 md:-top-10 -left-1 z-0 group-hover:text-primary/20 transition-colors">
              GET LINK
            </span>
            <div className="relative z-10 space-y-4">
              <h3 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
                GET LINK
              </h3>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                Paste the code you got and you will get the{" "}
                <span className="text-primary font-semibold underline decoration-2">
                  original link
                </span>{" "}
                instantly. Just share and retrieve.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowDoesItWork;
