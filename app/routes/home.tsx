// routes/home.tsx
import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import ResumeCard from "~/components/ResumeCard";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "~/lib/auth-context";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumAI | Home" },
    { name: "description", content: "Smart AI for your resume!" },
  ];
}

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?next=/');
    }
  }, [user, authLoading, navigate]);

  // Load resumes from database
  useEffect(() => {
    const loadResumes = async () => {
      if (!user) return;

      setLoadingResumes(true);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const response = await fetch('/api/resumes', {
          credentials: 'include',
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error('Failed to fetch resumes');
        }
        const payload = await response.json();
        const parsedResumes = Array.isArray(payload.resumes) ? payload.resumes : [];

        setResumes(parsedResumes);
      } catch (error) {
        console.error('Failed to load resumes:', error);
        setResumes([]);
      } finally {
        setLoadingResumes(false);
      }
    };
    
    if (user) {
      loadResumes();
    }
  }, [user]);

  if (authLoading) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading your resumes...</p>
      </div>
    </main>
  );
}

  return (
    <main>
      <Navbar/>
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications and Resume Rating</h1>
          {!loadingResumes && resumes?.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
          ) : (
            <h2>Review your submissions and check AI-powered feedback.</h2>
          )}
        </div>

        {/* Loading state */}
        {loadingResumes && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-12">
            <img src='/images/resume-scan-2.gif' className="w-[180px]" alt="Loading"/>
            <p className="mt-3 text-sm text-slate-500">Fetching your latest resume insights...</p>
          </div>
        )}
      
        {/* Resumes list */}
        {!loadingResumes && resumes.length > 0 && ( 
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}

        {/* No resumes state */}
        {!loadingResumes && resumes?.length === 0 && (
          <div className="mt-10 flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white py-12 text-center">
            <p className="max-w-md text-sm text-slate-500">
              Start by uploading your resume. We will analyze ATS compatibility, tone, structure, and key improvements.
            </p>
            <Link to='/upload' className="primary-button w-fit">
              Upload Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}