import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router';
import { usePuterStore } from '~/lib/puter'
import { useNavigate } from 'react-router';
import Summary from '~/components/Summary';
import ATS from '~/components/ATS';
import Details from '~/components/Details';
import JDMatch from '~/components/JDMatch';


export const meta = () => ([
    {title: 'ResumAI | Review'},
    {name: 'description', content: 'Detailed Resume Review and Feedback'},
])


const resume = () => {
    const {auth, isLoading, fs,kv} = usePuterStore();
    const {id} = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading])

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume_${id}`);

            if(!resume) return;

            const data = JSON.parse(resume);

            const resumeBlob = await fs.read(data.resumePath);
            if(!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], {type: 'application/pdf'});
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);

            const imageBlob = await fs.read(data.imagePath);
            if(!imageBlob) return;
            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);
            setFeedback(data.feedback);
            console.log({resumeUrl, imageUrl, feedback: data.feedback});
        }

        loadResume();
    }, [id])

  return (
    <main className='min-h-screen bg-slate-50'>
        <nav className='resume-nav'>
            <Link to='/' className='back-button'>
                <img src='/icons/back.svg' alt='logo' className='w-2.5 h-2.5'/>
                <span className='text-sm font-semibold'>Back to Homepage</span>
            </Link>
        </nav>
        <div className='feedback-layout'>
            <section className="feedback-section lg:sticky lg:top-20 lg:h-[calc(100vh-7rem)] lg:flex lg:items-center lg:justify-center">
                {imageUrl && resumeUrl &&(
                    <div className='animate-in fade-in duration-700 w-full'>
                        <a href={resumeUrl} target='_blank' rel='noopener noreferrer'>
                            <img
                            src={imageUrl}
                            className='w-full max-h-[70vh] rounded-xl object-contain'
                            title='resume'
                            />
                        </a>
                        </div>
                    )}
            </section>
            <section className='feedback-section'>
                <h2 className='mb-6 text-3xl font-bold text-slate-900'>Resume Review</h2>
                {feedback ? (
                    <div className='animate-in fade-in flex flex-col gap-8 duration-700'>
                        <Summary feedback={feedback} />
                        {feedback.jdMatch && <JDMatch jdMatch={feedback.jdMatch} />}
                        <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                        <Details feedback={feedback} />
                        </div>
                ) : (
                    <img src='/images/resume-scan-2.gif' className='w-full'/>
                )}
                </section>

        </div>
    </main>
  )
}

export default resume