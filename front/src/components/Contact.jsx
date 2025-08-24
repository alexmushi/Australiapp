import React from 'react';
import { FaEnvelope, FaLinkedin, FaGithub } from 'react-icons/fa';

export default function Contact() {
  return (
    <div className='p-4 bg-surface border-t border-gray-700'>
      <h3 className='text-lg mb-4 text-center'>Contacto</h3>
      <div className='flex justify-center gap-6'>
        <div className='flex items-center gap-2 text-gray-300'>
          <FaEnvelope className='text-primary' />
          <span>email@australiapp.com</span>
        </div>
        <div className='flex items-center gap-2 text-gray-300'>
          <FaLinkedin className='text-primary' />
          <a
            href='https://linkedin.com/company/australiapp'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:text-accent transition-colors'
          >
            LinkedIn
          </a>
        </div>
        <div className='flex items-center gap-2 text-gray-300'>
          <FaGithub className='text-primary' />
          <a
            href='https://github.com/alexmushi/Australiapp'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:text-accent transition-colors'
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}