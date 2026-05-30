export const resumes: Resume[] = [
  {
    id: "1",
    companyName: "Google",
    jobTitle: "Frontend Developer",
    imagePath: "/images/resume_01.png",
    resumePath: "/resumes/resume-1.pdf",
    feedback: {
      overallScore: 85,
      actionPlan: [
        {
          priority: "high",
          task: "Add 3 job-specific keywords to Summary and Experience sections",
          reason: "Improves ATS match for target role quickly",
        },
        {
          priority: "medium",
          task: "Rewrite 2 bullet points with measurable outcomes",
          reason: "Quantified impact improves recruiter readability",
        },
      ],
      jdMatch: {
        score: 88,
        matchedKeywords: ["React", "TypeScript", "REST API"],
        missingKeywords: ["CI/CD", "Unit Testing"],
        priorityImprovements: [
          "Highlight testing contributions in work experience",
          "Add CI/CD tooling experience in skills section",
        ],
      },
      ATS: {
        score: 90,
        tips: [],
      },
      toneAndStyle: {
        score: 90,
        tips: [],
      },
      content: {
        score: 90,
        tips: [],
      },
      structure: {
        score: 90,
        tips: [],
      },
      skills: {
        score: 90,
        tips: [],
      },
    },
  },
  {
    id: "2",
    companyName: "Microsoft",
    jobTitle: "Cloud Engineer",
    imagePath: "/images/resume_02.png",
    resumePath: "/resumes/resume-2.pdf",
    feedback: {
      overallScore: 55,
      actionPlan: [
        {
          priority: "high",
          task: "Add missing cloud stack keywords: Terraform, Kubernetes, Monitoring",
          reason: "Critical gap for Cloud Engineer matching",
        },
        {
          priority: "high",
          task: "Move most relevant support/cloud projects above less relevant sections",
          reason: "Improves relevance signal in first screen",
        },
      ],
      jdMatch: {
        score: 52,
        matchedKeywords: ["Cloud", "Linux"],
        missingKeywords: ["Terraform", "Kubernetes", "Monitoring"],
        priorityImprovements: [
          "Add infra-as-code project example",
          "Include observability stack exposure",
        ],
      },
      ATS: {
        score: 90,
        tips: [],
      },
      toneAndStyle: {
        score: 90,
        tips: [],
      },
      content: {
        score: 90,
        tips: [],
      },
      structure: {
        score: 90,
        tips: [],
      },
      skills: {
        score: 90,
        tips: [],
      },
    },
  },
  {
    id: "3",
    companyName: "Apple",
    jobTitle: "iOS Developer",
    imagePath: "/images/resume_03.png",
    resumePath: "/resumes/resume-3.pdf",
    feedback: {
      overallScore: 75,
      actionPlan: [
        {
          priority: "high",
          task: "Add testing workflow (XCTest) under iOS experience",
          reason: "Common requirement for iOS roles",
        },
        {
          priority: "medium",
          task: "Include release process keywords like TestFlight and CI",
          reason: "Strengthens delivery ownership signal",
        },
      ],
      jdMatch: {
        score: 71,
        matchedKeywords: ["Swift", "iOS", "Git"],
        missingKeywords: ["Unit Testing", "CI/CD"],
        priorityImprovements: [
          "Add XCTest-related achievements",
          "Mention release pipeline or TestFlight workflow",
        ],
      },
      ATS: {
        score: 90,
        tips: [],
      },
      toneAndStyle: {
        score: 90,
        tips: [],
      },
      content: {
        score: 90,
        tips: [],
      },
      structure: {
        score: 90,
        tips: [],
      },
      skills: {
        score: 90,
        tips: [],
      },
    },
  },
];

export const AIResponseFormat = `
      interface Feedback {
      overallScore: number; //max 100
      actionPlan: {
        priority: "high" | "medium" | "low"; //task priority by impact
        task: string; //clear one-line action item
        reason: string; //why this action matters
      }[]; //return 4-7 actionable tasks, prioritized
      jdMatch: {
        score: number; //0-100 match between resume and target job description
        matchedKeywords: string[]; //5-10 relevant keywords already present in the resume
        missingKeywords: string[]; //5-10 high-impact keywords missing from the resume
        priorityImprovements: string[]; //3-5 highest-priority actions to improve match score
      };
      ATS: {
        score: number; //rate based on ATS suitability
        tips: {
          type: "good" | "improve";
          tip: string; //give 3-4 tips
        }[];
      };
      toneAndStyle: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      content: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      structure: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      skills: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
    }`;

export const prepareInstructions = ({
  jobTitle,
  jobDescription,

}: {
  jobTitle: string;
  jobDescription: string;

}) =>
  `You are an expert in ATS (Applicant Tracking System) and resume analysis.
  Please analyze and rate this resume and suggest how to improve it.
  The rating can be low if the resume is bad.
  Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
  If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
  If available, use the job description for the job user is applying to to give more detailed feedback.
  If provided, take the job description into consideration.
  The job title is: ${jobTitle}
  The job description is: ${jobDescription}
  Provide the feedback using the following format: ${AIResponseFormat}
  Return the analysis as a JSON object, without any other text and without the backticks.
  Do not include any other text or comments.`;