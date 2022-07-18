import React from 'react';
import sentry from '../../assets/img/sentry.png';
import github from '../../assets/img/github.svg';

const Popup = () => {
  return (
    <div className="App bg-[#10082f] h-screen flex flex-col items-center justify-center gap-4 text-white">
      <img src={sentry} className="w-1/2" />
      <div className="flex items-center gap-3">
        <span className="flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-200 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-300"></span>
        </span>
        <p className="text-lg font-semibold">Monitoring contracts</p>
      </div>
      <button className="bg-[#2b226e] py-3 px-8 font-bold rounded-lg mt-5 hover:bg-[#1a1142]">
        Whitelist Site
      </button>
      <p className="absolute bottom-3 left-4 text-gray-400">
        Version {chrome.runtime.getManifest().version}
      </p>
      <a href="http://www.github.com/kevinz420" target="_blank">
        <img
          src={github}
          className="absolute bottom-3 right-4 cursor-pointer w-7"
        />
      </a>
    </div>
  );
};

export default Popup;
