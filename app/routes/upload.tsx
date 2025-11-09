import React, { type FormEvent } from 'react'
import Navbar from '~/components/Navbar'
import { useState } from 'react';
import FileUploader from '~/components/FileUploader';
import { usePuterStore } from '~/lib/puter';
import { useNavigate } from 'react-router';
import { convertPdfToImage } from '~/lib/pdf2img';
import { generateUUID } from '~/lib/utils';
import { prepareInstructions } from '../../constants';

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
            setIsProcessing(true)
            setStatusText('Uploading resume...')
            const uploadedFile = await fs.upload([file])
            if(!uploadedFile) return setStatusText('Failed to upload file.') 

            setStatusText('Analyzing resume...')
            const imageFile = await convertPdfToImage(file)
            if(!imageFile.file) return setStatusText('Failed to convert PDF to image.')

            setStatusText('Uploading the image...')
            const uploadedImage = await fs.upload([imageFile.file])
            if(!uploadedImage) return setStatusText('Failed to upload image.')

            setStatusText('Preparing data...')
            const uuid = generateUUID()
            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName,
                jobTitle,
                jobDescription,
                feedback:''
            }
            await kv.set(`resume_${uuid}`, JSON.stringify(data))

            setStatusText('Analyzing...')
            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({jobTitle, jobDescription})
            )
            if (!feedback) return setStatusText('Failed to analyze resume.')

            const feedbackText = typeof feedback.message.content === 'string' 
                ? feedback.message.content
                : feedback.message.content[0].text

            data.feedback = JSON.parse(feedbackText)
            await kv.set(`resume_${uuid}`, JSON.stringify(data))
            setStatusText('Analysis complete!')
            navigate(`/resume/${uuid}`)
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
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50/30">
      <Navbar/>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
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
              className="w-full bg-linear-to-br from-blue-500 to-purple-600 text-white py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
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