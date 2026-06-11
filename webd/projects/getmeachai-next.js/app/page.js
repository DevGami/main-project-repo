import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <div className="relative flex justify-center flex-col gap-6 items-center text-white min-h-[60vh] px-5 md:px-0 text-xs md:text-base bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]"></div>
        </div>
        
        <div className="z-10 font-extrabold flex flex-col md:flex-row gap-4 md:gap-6 md:text-6xl justify-center items-center text-4xl mt-10">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">Get Me A Chai</span>
          <span className="relative flex items-center justify-center w-20 h-20 bg-white/5 rounded-full border border-white/10 shadow-2xl shadow-orange-500/20">
            <Image className="invertImg drop-shadow-lg" src="/tea.gif" width={60} height={60} alt="Chai Cup" priority />
          </span>
        </div>
        
        <p className="z-10 text-center md:text-lg max-w-2xl text-slate-300 leading-relaxed mt-4">
          A premium crowdfunding platform for creators to fund their projects. <br/>
          Unleash the power of your fans and get your creative endeavors funded, one chai at a time.
        </p>
        
        <div className="z-10 flex flex-wrap justify-center gap-4 mt-6">
          <Link href={"/login"}>
            <button type="button" className="text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 focus:ring-4 focus:outline-none focus:ring-amber-500/50 font-medium rounded-xl text-lg px-8 py-3.5 text-center transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1">
              Start Your Journey
            </button>
          </Link>

          <Link href="/about">
            <button type="button" className="text-white bg-white/10 hover:bg-white/20 border border-white/10 focus:ring-4 focus:outline-none focus:ring-slate-500/50 font-medium rounded-xl text-lg px-8 py-3.5 text-center transition-all hover:-translate-y-1 backdrop-blur-sm">
              Read More
            </button>
          </Link>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-transparent via-white/20 to-transparent h-px w-full"></div>

      {/* Features Section */}
      <div className="text-white container mx-auto pb-32 pt-20 px-10 relative">
        <h2 className="text-4xl font-extrabold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">
          Your Fans can buy you a Chai
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Feature 1 */}
          <div className="group bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center transition-all hover:-translate-y-2 hover:bg-slate-800/80 hover:shadow-2xl hover:border-white/10">
            <div className="bg-slate-700/50 rounded-full p-4 mb-6 shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-300">
              <Image width={80} height={80} src="/man.gif" alt="Fans want to help" />
            </div>
            <p className="font-bold text-xl text-center mb-2 text-white">Fans want to help</p>
            <p className="text-center text-slate-400">Your fans are available to support your creative journey.</p>
          </div>
          
          {/* Feature 2 */}
          <div className="group bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center transition-all hover:-translate-y-2 hover:bg-slate-800/80 hover:shadow-2xl hover:border-white/10">
            <div className="bg-slate-700/50 rounded-full p-4 mb-6 shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-300">
              <Image width={80} height={80} src="/coin.gif" alt="Fans want to contribute" />
            </div>
            <p className="font-bold text-xl text-center mb-2 text-white">Fans contribute</p>
            <p className="text-center text-slate-400">Your fans are willing to contribute financially to your work.</p>
          </div>
          
          {/* Feature 3 */}
          <div className="group bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center transition-all hover:-translate-y-2 hover:bg-slate-800/80 hover:shadow-2xl hover:border-white/10">
            <div className="bg-slate-700/50 rounded-full p-4 mb-6 shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-300">
              <Image width={80} height={80} src="/group.gif" alt="Fans want to collaborate" />
            </div>
            <p className="font-bold text-xl text-center mb-2 text-white">Fans collaborate</p>
            <p className="text-center text-slate-400">Your fans are ready to collaborate and engage with you.</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-transparent via-white/20 to-transparent h-px w-full"></div>

      {/* Video Section */}
      <div className="text-white container mx-auto pb-32 pt-20 flex flex-col items-center justify-center">
        <h2 className="text-4xl font-extrabold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">
          Learn more about us
        </h2>
        
        <div className="w-[90%] md:w-[70%] lg:w-[60%] aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/10">
          <iframe 
            className="w-full h-full" 
            src="https://www.youtube.com/embed/ojuUnfqnUI0?si=wMUv4DG3ia6Wt4zn" 
            title="YouTube video player" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowFullScreen>
          </iframe>
        </div>
      </div>
    </>
  );
}
