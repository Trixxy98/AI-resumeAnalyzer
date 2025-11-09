// routes/home.tsx
import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import ResumeCard from "~/components/ResumeCard";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useAuth } from "~/lib/auth-context";
import { query } from "~/lib/database";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumAI" },
    { name: "description", content: "Smart AI for your resume!" },
  ];
}

export default function Home() {
  const { auth: puterAuth } = usePuterStore();
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
        const result = await query(
          'SELECT * FROM resumes WHERE user_id = $1 ORDER BY created_at DESC',
          [user.id]
        );

        const parsedResumes = result.rows.map(row => ({
          id: row.id,
          companyName: row.company_name,
          jobTitle: row.job_title,
          imagePath: row.image_path,
          resumePath: row.resume_path,
          feedback: row.feedback,
        }));

        setResumes(parsedResumes);
      } catch (error) {
        console.error('Failed to load resumes:', error);
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
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
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
          <div className="flex flex-col items-center justify-center">
            <img src='/images/resume-scan-2.gif' className="w-[200px]" alt="Loading"/>
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
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link to='/upload' className="primary-button w-fit text-xl font-semibold">
              Upload Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}