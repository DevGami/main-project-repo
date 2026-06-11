import React from 'react';
import Image from 'next/image';

const About = () => {
    return (
        <div className="min-h-screen bg-slate-900 text-white pb-20">
            {/* Header Section */}
            <div className="bg-slate-800/50 py-16 border-b border-white/5">
                <div className="container mx-auto px-8 md:px-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">
                        About Get Me a Chai
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-3xl leading-relaxed">
                        Get Me a Chai is a crowdfunding platform designed for creators to fund their projects with the support of their fans. It&apos;s a space where your fans can directly contribute to your creative endeavors by buying you a chai. Unlock the potential of your fanbase and bring your projects to life.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-8 md:px-4 py-12">
                <h2 className="text-3xl font-bold mb-8 text-white">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6 flex items-start hover:bg-slate-800 transition-colors">
                        <div className="bg-slate-700/50 rounded-full p-3 mr-6 shrink-0">
                            <Image className="w-16 h-16" width={64} height={64} src="/group.gif" alt="Fans Want to Collaborate" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2 text-white">Fans Want to Collaborate</h3>
                            <p className="text-slate-400">Your fans are enthusiastic about collaborating with you on your projects.</p>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6 flex items-start hover:bg-slate-800 transition-colors">
                        <div className="bg-slate-700/50 rounded-full p-3 mr-6 shrink-0">
                            <Image className="w-16 h-16" width={64} height={64} src="/coin.gif" alt="Support Through Chai" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2 text-white">Support Through Chai</h3>
                            <p className="text-slate-400">Receive support from your fans in the form of chai purchases, directly contributing to your project funding.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Benefits Section 1 */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-purple-400">Benefits for Creators</h2>
                            <ul className="space-y-3 text-slate-300">
                                <li className="flex items-center gap-3"><span className="text-orange-500">✓</span> Direct financial support from your fanbase</li>
                                <li className="flex items-center gap-3"><span className="text-orange-500">✓</span> Engage with your fans on a more personal level</li>
                                <li className="flex items-center gap-3"><span className="text-orange-500">✓</span> Access to a platform tailored for creative projects</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-purple-400">Benefits for Fans</h2>
                            <ul className="space-y-3 text-slate-300">
                                <li className="flex items-center gap-3"><span className="text-blue-500">✓</span> Directly contribute to the success of your favorite creators</li>
                                <li className="flex items-center gap-3"><span className="text-blue-500">✓</span> Exclusive rewards and perks for supporting creators</li>
                                <li className="flex items-center gap-3"><span className="text-blue-500">✓</span> Be part of the creative process and connect with creators</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-purple-400">Benefits of Collaboration</h2>
                            <ul className="space-y-3 text-slate-300">
                                <li className="flex items-start gap-3"><span className="text-green-500 mt-1">✓</span> <span>Unlock new opportunities through collaboration with fellow creators</span></li>
                                <li className="flex items-center gap-3"><span className="text-green-500">✓</span> Expand your network and reach a wider audience</li>
                                <li className="flex items-center gap-3"><span className="text-green-500">✓</span> Combine skills and resources to create innovative projects</li>
                            </ul>
                        </div>
                    </div>

                    {/* Benefits Section 2 */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-amber-400">Community Engagement</h2>
                            <ul className="space-y-3 text-slate-300">
                                <li className="flex items-start gap-3"><span className="text-yellow-500 mt-1">✓</span> <span>Interact with a supportive community of like-minded individuals</span></li>
                                <li className="flex items-center gap-3"><span className="text-yellow-500">✓</span> Receive valuable feedback and encouragement from peers</li>
                                <li className="flex items-start gap-3"><span className="text-yellow-500 mt-1">✓</span> <span>Participate in discussions and events centered around your interests</span></li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-amber-400">Access to Resources</h2>
                            <ul className="space-y-3 text-slate-300">
                                <li className="flex items-start gap-3"><span className="text-pink-500 mt-1">✓</span> <span>Gain access to resources such as tutorials, templates, and tools</span></li>
                                <li className="flex items-center gap-3"><span className="text-pink-500">✓</span> Receive guidance and mentorship from experienced creators</li>
                                <li className="flex items-center gap-3"><span className="text-pink-500">✓</span> Stay updated on industry trends and best practices</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-amber-400">Recognition and Exposure</h2>
                            <ul className="space-y-3 text-slate-300">
                                <li className="flex items-start gap-3"><span className="text-indigo-500 mt-1">✓</span> <span>Showcase your work to a global audience and gain recognition</span></li>
                                <li className="flex items-center gap-3"><span className="text-indigo-500">✓</span> Feature in promotional materials and campaigns</li>
                                <li className="flex items-start gap-3"><span className="text-indigo-500 mt-1">✓</span> <span>Build your portfolio and increase your credibility as a creator</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default About;

export const metadata = {
    title: "About - Get Me A Chai",
}
   