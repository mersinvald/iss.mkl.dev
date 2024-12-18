import React from 'react';
import Navigation from '@/components/Navigation/Navigation';
import { Card } from '@/components/ui/card';

const AboutPage = () => {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-slate-900 text-slate-100">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-blue-400">About Me</h1>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-6">
              <p className="text-lg leading-relaxed">
                Hey there! <br></br><br></br> I&apos;m Mike, and this is my corner of the internet to share my passion for the night sky.
                I created this space to both showcase my astrophotography work and record my journey in this hobby, 
                so that I could go back and see the very first images I&apos;ve taken, and how the quality has (hopefully) improved over time.
              </p>
              <br></br>
              <p className="text-lg leading-relaxed">  
                You can reach me at <a href="mailto:iss@mkl.dev" className="text-red-400">iss@mkl.dev</a>.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="aspect-video relative rounded-lg">
                <img
                  src="/images/about/me.jpg"
                  alt="Astrophotography setup in the desert"
                  className="object-cover"
                />
              </div>
            </Card>
          </div>

          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">The Journey</h2>
            <p className="text-lg leading-relaxed mb-4">
              I&apos;ve always been fascinated with the night sky and the photos other people take, and finally have decided to pull the plug and give it a go myself in late Fall of 2024.
              Mostly with the stuff I already had: a Sony camera and a long telephoto zoom, aside from the entry-level Skywatcher GoTo mount. 
            </p>
            <p className="text-lg leading-relaxed">
              Currently based in the UAE, I&apos;m fortunate to have access to dark skies and clear nights most of the year, even if I have to drive pretty far out of the city.
            </p>
            <p className="text-lg leading-relaxed mb-4">
            My primary locations are the test site at the <a href="https://maps.app.goo.gl/NwKJUqarzVKWvA8j9" className="text-red-400">Salt Lake near Abu Dhabi</a>, a light poluted place, but close to home, and the main shooting site at <a href="https://maps.app.goo.gl/7CnnrZ8WPC3XA5AW8" className="text-red-400">Abu Qrayn Desert</a>, the darkest place in the country.
            </p>
            <p className="text-lg leading-relaxed">
            I&apos;m always looking for new places to shoot, so if you know of any good spots in the UAE, please let me know!
            </p>
          </Card>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">The Setup</h2>
              <p className="text-lg leading-relaxed mb-4">
                For now, it&apos;s a Sony A7IV full-frame camera with a GM 100-400 f4.5-5.6 lens, the SkyWatcher GTi tracking mount, on top of a Peak Design tripod.
              </p>
              <p className="text-lg leading-relaxed">
                The brains of operation the holy Ktulhu of wires and a Windows 11 mini-PC running N.I.N.A.<br></br>
                I also got a n Anker battery, that, with some power target tweaking of the PC, can support up to 7 hours of shooting. If switched to 12v output via car plug, potentially I can extend it even more, but I&apos;m yet to give that a try.
              </p>
            </Card>
            <Card className="p-6">
              <div className="aspect-video relative rounded-lg">
                <img
                  src="/images/about/setup.jpg"
                  alt="Astrophotography setup in the desert"
                  className="object-cover"
                />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
};

export default AboutPage;