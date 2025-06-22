import React from 'react';
import Navbar from '../components/Navbar.jsx';
import ReviewerForm from '../components/ReviewerForm.jsx';

export default function ReviewersPage() {
  return (
    <div>
      <Navbar />
      <div className='p-4'>
        <h2 className='text-xl mb-4'>Agregar Revisor</h2>
        <ReviewerForm />
      </div>
    </div>
  );
}
