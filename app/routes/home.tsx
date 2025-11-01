import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import ResumeCard from "~/components/ResumeCard";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumAI" },
    { name: "description", content: "Smart AI for your resume!" },
  ];
}

export default function Home() {
  const {auth, kv} = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if(!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated])

  // Load resumes from KV store
  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);

      // Fixed: Changed pattern from 'resume:*' to 'resume_*' to match the key format used in upload.tsx
      const resumes = (await kv.list('resume_*', true)) as KVItem[]

      const parsedResumes = resumes?.map((resume) => (
        JSON.parse(resume.value) as Resume
      ))

      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    }
    
    if(auth.isAuthenticated) {
      loadResumes();
    }
  }, [auth.isAuthenticated])

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
