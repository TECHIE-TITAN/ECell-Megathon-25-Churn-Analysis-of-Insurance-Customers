import React from 'react';
import { Button } from './ui/Button';
import { UserAvatarIcon } from './icons/UserAvatarIcon';

interface AboutUsPageProps {
  onBack: () => void;
}

const teamMembers = [
  { name: 'Het Selarka', role: 'Only ECE guy in the team' },
  { name: 'Vansh Goyal', role: 'Bakchodi Expert' },
  { name: 'Prathmesh Sharma', role: 'Only Coder' },
  { name: 'Aishani Sood', role: 'Diversity Category' },
  { name: 'Saksham Goyal', role: 'Baniya' },
];

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ onBack }) => {
  return (
    <main className="flex-1 flex flex-col items-center p-6 lg:p-8 overflow-y-auto">
      <div className="w-full max-w-4xl">
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-8 lg:p-12 border border-gray-300/50 dark:border-gray-700/50 rounded-xl shadow-2xl">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight sm:text-5xl font-display">
            About Turing Finances
          </h1>
          <div className="mt-8 border-t border-gray-300/50 dark:border-gray-700/50 pt-8 space-y-4 text-gray-700 dark:text-gray-300">
            <p className="leading-relaxed">
              Founded on the principle of leveraging technology for financial security, Turing Finances has been a pioneer in the insure-tech industry since its inception. We believe that insurance should be intelligent, transparent, and, most importantly, centered around the customer.
            </p>
            <p className="leading-relaxed">
              Our team consists of world-class data scientists, software engineers, and insurance experts dedicated to building predictive models that accurately assess risk and provide fair, personalized pricing. By harnessing the power of artificial intelligence and machine learning, we're not just predicting the future; we're helping you secure it.
            </p>
          </div>
          
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white font-display">Our Team</h2>
            <p className="mt-2 text-center text-gray-600 dark:text-gray-400">The brilliant minds behind Turing Finances.</p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                {teamMembers.map((member) => (
                    <div key={member.name} className="text-center flex flex-col items-center">
                        <div className="mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-24 w-24 flex items-center justify-center">
                            <UserAvatarIcon className="h-16 w-16 text-gray-500 dark:text-gray-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                    </div>
                ))}
            </div>
          </div>

        </div>
        <div className="mt-8 text-center">
            <Button onClick={onBack} className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700">
                &larr; Back to Home
            </Button>
        </div>
      </div>
    </main>
  );
};