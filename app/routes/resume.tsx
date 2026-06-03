import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router';
import { usePuterStore } from '~/lib/puter'
import { useNavigate } from 'react-router';
import Summary from '~/components/Summary';
import ATS from '~/components/ATS';
import Details from '~/components/Details';
import JDMatch from '~/components/JDMatch';
import VersionCompare from '~/components/VersionCompare';
import ActionPlan from '~/components/ActionPlan';
import RewriteAssistant from '~/components/RewriteAssistant';
import ExportReportButton from '~/components/ExportReportButton';


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
    const [resumeData, setResumeData] = useState<Resume | null>(null);
    const [resumeVersion, setResumeVersion] = useState(1);
    const [comparison, setComparison] = useState<ResumeComparison | null>(null);
    const [versionHistory, setVersionHistory] = useState<
      { id: string; version: number; createdAt?: string; overallScore?: number; jdMatchScore?: number }[]
    >([]);
    const navigate = useNavigate();

    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading])

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume_${id}`);

            if(!resume) return;

            const data = JSON.parse(resume) as Resume;
            setResumeData(data);

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
            setResumeVersion(data.version || 1);
            setComparison(data.comparison || null);

            if (data.jobKey) {
              const versionsRaw = await kv.get(`resume_versions_${data.jobKey}`);
              if (versionsRaw) {
                const versionIds = JSON.parse(versionsRaw);
                if (Array.isArray(versionIds)) {
                  const historyItems = await Promise.all(
                    versionIds.map(async (versionId: string) => {
                      const raw = await kv.get(`resume_${versionId}`);
                      if (!raw) return null;
                      const parsed = JSON.parse(raw) as Resume;
                      return {
                        id: parsed.id,
                        version: parsed.version || 1,
                        createdAt: parsed.createdAt,
                        overallScore: parsed.feedback?.overallScore,
                        jdMatchScore: parsed.feedback?.jdMatch?.score,
                      };
                    })
                  );
                  setVersionHistory(historyItems.filter(Boolean) as {
                    id: string;
                    version: number;
                    createdAt?: string;
                    overallScore?: number;
                    jdMatchScore?: number;
                  }[]);
                }
              }
            }
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
                <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
                  <h2 className='text-3xl font-bold text-slate-900'>Resume Review</h2>
                  {feedback && (
                    <ExportReportButton
                      resumeId={id || "unknown"}
                      resumeData={resumeData}
                      feedback={feedback}
                      version={resumeVersion}
                      comparison={comparison}
                      versionHistory={versionHistory}
                    />
                  )}
                </div>
                {feedback ? (
                    <div className='animate-in fade-in flex flex-col gap-8 duration-700'>
                        <Summary feedback={feedback} />
                        <VersionCompare
                          currentVersion={resumeVersion}
                          comparison={comparison}
                          versions={versionHistory}
                        />
                        <ActionPlan feedback={feedback} resumeId={id || "unknown"} />
                        <RewriteAssistant
                          feedback={feedback}
                          jobTitle={resumeData?.jobTitle}
                          jobDescription={resumeData?.jobDescription}
                        />
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