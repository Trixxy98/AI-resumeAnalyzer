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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
              {companyName && (
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {companyName}
                </h2>
              )}
              {jobTitle && (
                <h3 className="text-gray-600">{jobTitle}</h3>
              )}
              {!companyName && !jobTitle && (
                <h2 className="text-xl font-semibold text-gray-900">Resume</h2>
              )}
            </div>
            <ScoreCircle score={feedback.overallScore} />
          </div>
        </div>
        {resumeUrl && (
          <div className="border-t border-gray-100">
            <div className="aspect-3/4] overflow-hidden">
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