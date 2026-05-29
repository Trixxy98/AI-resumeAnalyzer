import React, { type FormEvent } from 'react'
import Navbar from '~/components/Navbar'
import { useState } from 'react';
import FileUploader from '~/components/FileUploader';
import { usePuterStore } from '~/lib/puter';
import { useNavigate } from 'react-router';
import { convertPdfToImage } from '~/lib/pdf2img';
import { generateUUID } from '~/lib/utils';
import { prepareInstructions } from '../../constants';

const normalizeKeyPart = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const buildJobKey = (companyName: string, jobTitle: string) => {
  const company = normalizeKeyPart(companyName) || 'general';
  const title = normalizeKeyPart(jobTitle) || 'untitled-role';
  return `${company}__${title}`;
};

const upload = () => {
    const {auth, isLoading, fs, ai, kv} = usePuterStore()
    const navigate = useNavigate()
    const [isProcessing, setIsProcessing] = useState(false)
    const [statusText, setStatusText] = useState('')
    const [file, setFile] = useState<File | null>(null)

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyze = async ({companyName, jobTitle, jobDescription, file}: {
        companyName: string;
        jobTitle: string;
        jobDescription: string;
        file: File;}) => {
            const parseFeedbackJson = (rawText: string): Feedback | null => {
                const trimmed = rawText.trim();
                const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
                const candidate = fencedMatch ? fencedMatch[1].trim() : trimmed;

                try {
                    return JSON.parse(candidate);
                } catch (error) {
                    console.error('Failed to parse AI feedback JSON:', error);
                    return null;
                }
            };

            try {
            setIsProcessing(true)
            setStatusText('Uploading resume...')
            const uploadedFile = await fs.upload([file])
            if(!uploadedFile) {
                setStatusText('Failed to upload file.')
                return;
            } 

            setStatusText('Analyzing resume...')
            const imageFile = await convertPdfToImage(file)
            if(!imageFile.file) {
                setStatusText('Failed to convert PDF to image.')
                return;
            }

            setStatusText('Uploading the image...')
            const uploadedImage = await fs.upload([imageFile.file])
            if(!uploadedImage) {
                setStatusText('Failed to upload image.')
                return;
            }

            setStatusText('Preparing data...')
            const uuid = generateUUID()
            const createdAt = new Date().toISOString();
            const jobKey = buildJobKey(companyName, jobTitle);
            const versionsIndexKey = `resume_versions_${jobKey}`;
            const existingVersionsRaw = await kv.get(versionsIndexKey);
            const existingVersions = (() => {
                if (!existingVersionsRaw) return [] as string[];
                try {
                    const parsed = JSON.parse(existingVersionsRaw);
                    return Array.isArray(parsed) ? parsed as string[] : [];
                } catch {
                    return [] as string[];
                }
            })();
            const version = existingVersions.length + 1;
            const previousResumeId = existingVersions.length > 0 ? existingVersions[0] : null;

            const data: {
                id: string;
                resumePath: string;
                imagePath: string;
                companyName: string;
                jobTitle: string;
                jobDescription: string;
                feedback: Feedback | null;
                version: number;
                jobKey: string;
                createdAt: string;
                previousResumeId: string | null;
                comparison: ResumeComparison | null;
            } = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName,
                jobTitle,
                jobDescription,
                feedback: null,
                version,
                jobKey,
                createdAt,
                previousResumeId,
                comparison: null,
            }
            await kv.set(`resume_${uuid}`, JSON.stringify(data))

            setStatusText('Analyzing...')
            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({jobTitle, jobDescription})
            )
            if (!feedback) {
                setStatusText('Failed to analyze resume.')
                return;
            }

            const feedbackText = typeof feedback.message.content === 'string' 
                ? feedback.message.content
                : feedback.message.content[0].text

            const parsedFeedback = parseFeedbackJson(feedbackText)
            if (!parsedFeedback) {
                setStatusText('AI response format invalid. Please try again.')
                return;
            }

            data.feedback = parsedFeedback

            if (previousResumeId) {
                const previousRaw = await kv.get(`resume_${previousResumeId}`);
                if (previousRaw) {
                    const previousData = JSON.parse(previousRaw);
                    if (previousData?.feedback) {
                        data.comparison = {
                            previousResumeId,
                            overallDelta: parsedFeedback.overallScore - (previousData.feedback.overallScore || 0),
                            atsDelta: parsedFeedback.ATS.score - (previousData.feedback.ATS?.score || 0),
                            jdMatchDelta:
                                parsedFeedback.jdMatch?.score !== undefined &&
                                previousData.feedback.jdMatch?.score !== undefined
                                    ? parsedFeedback.jdMatch.score - previousData.feedback.jdMatch.score
                                    : null,
                        };
                    }
                }
            }

            await kv.set(`resume_${uuid}`, JSON.stringify(data))
            await kv.set(versionsIndexKey, JSON.stringify([uuid, ...existingVersions]))
            setStatusText('Analysis complete!')
            navigate(`/resume/${uuid}`)
            } catch (error) {
                console.error('Resume analysis failed:', error)
                setStatusText('Analysis failed. Please try again.')
            } finally {
                setIsProcessing(false)
            }
        }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) {
            setStatusText('Please upload a resume.');
            return;
        }
        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }
    

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar/>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">
            Smart Feedback for Your 
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
              Dream Job
            </span>
          </h1>
          {isProcessing ? (
            <div className="space-y-4">
              <p className="text-xl text-gray-600">{statusText}</p>
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <p className="text-xl text-gray-600">
              Upload your resume for detailed ATS scoring and improvement tips
            </p>
          )}
        </div>

        {!isProcessing && (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input 
                  type="text" 
                  name="company-name" 
                  placeholder="Google, Microsoft, etc."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="job-title" className="block text-sm font-medium text-gray-700">
                  Job Title
                </label>
                <input 
                  type="text" 
                  name="job-title" 
                  placeholder="Frontend Developer, etc."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="job-description" className="block text-sm font-medium text-gray-700">
                Job Description
              </label>
              <textarea 
                rows={5} 
                name="job-description" 
                placeholder="Paste the job description here..."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Upload Resume
              </label>
              <FileUploader onFileSelect={handleFileSelect}/>
            </div>
            
            <button 
              type="submit" 
              className="w-full rounded-xl bg-slate-900 py-4 text-lg font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!file}
            >
              Analyze Resume
            </button>
          </form>
        )}
      </section>
    </div>
  )
}

export default upload