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

const normalizeFeedback = (rawFeedback: unknown): Feedback | null => {
  if (!rawFeedback || typeof rawFeedback !== 'object') return null;

  const data = rawFeedback as Partial<Feedback>;
  const normalizeTipsWithExplanation = (
    tips: unknown
  ): { type: "good" | "improve"; tip: string; explanation: string }[] => {
    if (!Array.isArray(tips)) return [];
    return tips
      .filter((item) => item && typeof item === 'object')
      .map((item) => {
        const tipData = item as { type?: unknown; tip?: unknown; explanation?: unknown };
        const typeValue: "good" | "improve" = tipData.type === 'good' ? 'good' : 'improve';
        return {
          type: typeValue,
          tip: typeof tipData.tip === 'string' ? tipData.tip : '',
          explanation: typeof tipData.explanation === 'string' ? tipData.explanation : '',
        };
      })
      .filter((item) => item.tip.length > 0);
  };

  const normalizeAtsTips = (tips: unknown): { type: "good" | "improve"; tip: string }[] => {
    if (!Array.isArray(tips)) return [];
    return tips
      .filter((item) => item && typeof item === 'object')
      .map((item) => {
        const tipData = item as { type?: unknown; tip?: unknown };
        const typeValue: "good" | "improve" = tipData.type === 'good' ? 'good' : 'improve';
        return {
          type: typeValue,
          tip: typeof tipData.tip === 'string' ? tipData.tip : '',
        };
      })
      .filter((item) => item.tip.length > 0);
  };

  return {
    overallScore: typeof data.overallScore === 'number' ? data.overallScore : 0,
    actionPlan: Array.isArray(data.actionPlan)
      ? data.actionPlan
          .map((item) => ({
            priority:
              item?.priority === 'high' || item?.priority === 'medium' || item?.priority === 'low'
                ? item.priority
                : 'medium',
            task: typeof item?.task === 'string' ? item.task : '',
            reason: typeof item?.reason === 'string' ? item.reason : undefined,
          }))
          .filter((item) => item.task.length > 0)
      : [],
    jdMatch:
      data.jdMatch && typeof data.jdMatch === 'object'
        ? {
            score: typeof data.jdMatch.score === 'number' ? data.jdMatch.score : 0,
            matchedKeywords: Array.isArray(data.jdMatch.matchedKeywords)
              ? data.jdMatch.matchedKeywords.filter((item): item is string => typeof item === 'string')
              : [],
            missingKeywords: Array.isArray(data.jdMatch.missingKeywords)
              ? data.jdMatch.missingKeywords.filter((item): item is string => typeof item === 'string')
              : [],
            priorityImprovements: Array.isArray(data.jdMatch.priorityImprovements)
              ? data.jdMatch.priorityImprovements.filter((item): item is string => typeof item === 'string')
              : [],
          }
        : undefined,
    ATS: {
      score: typeof data.ATS?.score === 'number' ? data.ATS.score : 0,
      tips: normalizeAtsTips(data.ATS?.tips),
    },
    toneAndStyle: {
      score: typeof data.toneAndStyle?.score === 'number' ? data.toneAndStyle.score : 0,
      tips: normalizeTipsWithExplanation(data.toneAndStyle?.tips),
    },
    content: {
      score: typeof data.content?.score === 'number' ? data.content.score : 0,
      tips: normalizeTipsWithExplanation(data.content?.tips),
    },
    structure: {
      score: typeof data.structure?.score === 'number' ? data.structure.score : 0,
      tips: normalizeTipsWithExplanation(data.structure?.tips),
    },
    skills: {
      score: typeof data.skills?.score === 'number' ? data.skills.score : 0,
      tips: normalizeTipsWithExplanation(data.skills?.tips),
    },
  };
};


export const meta = () => ([
    {title: 'ResumAI | Review'},
    {name: 'description', content: 'Detailed Resume Review and Feedback'},
])


const Resume = () => {
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
            const currentResumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(currentResumeUrl);


            const imageBlob = await fs.read(data.imagePath);
            if(!imageBlob) return;
            const currentImageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(currentImageUrl);
        
            setFeedback(normalizeFeedback(data.feedback));
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

        return () => {
            if (resumeUrl) URL.revokeObjectURL(resumeUrl);
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        }
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

export default Resume