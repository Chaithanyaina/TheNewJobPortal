import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Search } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();

  const onSearch = (data) => {
    navigate(`/jobs?q=${data.search}`);
  };

  return (
    <div className="container mx-auto px-4 text-center py-16 md:py-24">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-text-primary">Find Your Dream Job Today</h1>
      <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
        Search through thousands of job listings from top companies and find your next career move.
      </p>

      <form
        onSubmit={handleSubmit(onSearch)}
        className="max-w-2xl mx-auto flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 shadow-md"
      >
        <input
          {...register('search')}
          type="text"
          placeholder="Job title, keywords, or company"
          className="w-full bg-transparent focus:outline-none text-lg px-2"
        />
        <button
          type="submit"
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
        >
          <Search className="h-5 w-5 text-gray-600" />
        </button>
      </form>
    </div>
  );
};

export default HomePage;
