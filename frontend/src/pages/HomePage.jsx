import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Button from '../components/common/Button';
import { Search } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();

  const onSearch = (data) => {
    navigate(`/jobs?q=${data.search}`);
  };

  return (
    // ADDED container class here for this specific page
    <div className="container mx-auto px-4 text-center py-16 md:py-24">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-text-primary">Find Your Dream Job Today</h1>
      <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
        Search through thousands of job listings from top companies and find your next career move.
      </p>
      
      <form onSubmit={handleSubmit(onSearch)} className="max-w-2xl mx-auto flex items-center border rounded-full p-2 shadow-lg bg-white">
        <Search className="h-6 w-6 text-gray-400 mx-3" />
        <input
          {...register('search')}
          type="text"
          placeholder="Job title, keywords, or company"
          className="w-full bg-transparent focus:outline-none text-lg"
        />
        <Button type="submit" className="rounded-full px-6">
          Search
        </Button>
      </form>
    </div>
  );
};

export default HomePage;