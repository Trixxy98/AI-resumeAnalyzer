import React from 'react'
import { Link } from 'react-router'
import ScoreCircle from './ScoreCircle'
import { usePuterStore } from '~/lib/puter'
import { useEffect } from 'react'
import { useState } from 'react'


const ResumeCard = ({resume:{id, companyName, jobTitle, feedback, imagePath}}: {resume: Resume}) => {
  const {fs} = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState('');

  useEffect(() => {
    const loadResume = async () => {
      const blob = await fs.read(imagePath);
      if(!blob) return;
      let url = URL.createObjectURL(blob);
      setResumeUrl(url);
    }
    loadResume();
  }, [imagePath])

  return (
    <Link to={`/resume/${id}`} className="group"> 
      <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-md">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
              {companyName && (
                <h2 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {companyName}
                </h2>
              )}
              {jobTitle && (
                <h3 className="text-slate-600">{jobTitle}</h3>
              )}
              {!companyName && !jobTitle && (
                <h2 className="text-xl font-semibold text-slate-900">Resume</h2>
              )}
            </div>
            <ScoreCircle score={feedback.overallScore} />
          </div>
        </div>
        {resumeUrl && feedback && (
          <div className="border-t border-slate-100">
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={resumeUrl}
                alt="resume preview"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}

export default ResumeCard