'use client';

import React, { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation/Navigation';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const AboutPage = () => {
  const { messages } = useLanguage();
  const [mounted,  setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !messages.about) {
    return null;
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-slate-900 text-slate-100">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-blue-400">{messages.about.title}</h1>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-6">
              <p className="text-lg leading-relaxed">
                {messages.about.intro.greeting} <br></br><br></br> {messages.about.intro.paragraph1}
              </p>
              <br></br>
              <p className="text-lg leading-relaxed">  
                {messages.about.intro.paragraph2} <a href="mailto:iss@mkl.dev" className="text-red-400">iss@mkl.dev</a>.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="aspect-video relative rounded-lg">
                <img
                  src="/images/about/me.jpg"
                  alt={messages.about.imageAlt.me}
                  className="object-cover"
                />
              </div>
            </Card>
          </div>

          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">{messages.about.journey.title}</h2>
            <p className="text-lg leading-relaxed mb-4">
              {messages.about.journey.paragraph1}
            </p>
            <p className="text-lg leading-relaxed">
              {messages.about.journey.paragraph2}
            </p>
            <p className="text-lg leading-relaxed mb-4">
              {messages.about.journey.paragraph3} <a href="https://maps.app.goo.gl/NwKJUqarzVKWvA8j9" className="text-red-400">{messages.about.journey.saltLake}</a>{messages.about.journey.paragraph3b} <a href="https://maps.app.goo.gl/7CnnrZ8WPC3XA5AW8" className="text-red-400">{messages.about.journey.abuQrayn}</a>{messages.about.journey.paragraph3c}
            </p>
            <p className="text-lg leading-relaxed">
              {messages.about.journey.paragraph4}
            </p>
          </Card>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">{messages.about.setup.title}</h2>
              <p className="text-lg leading-relaxed mb-4">
                {messages.about.setup.paragraph1}
              </p>
              <p className="text-lg leading-relaxed">
                {messages.about.setup.paragraph2}<br></br>
                {messages.about.setup.paragraph2b}
              </p>
            </Card>
            <Card className="p-6">
              <div className="aspect-video relative rounded-lg">
                <img
                  src="/images/about/setup.jpg"
                  alt={messages.about.imageAlt.setup}
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
