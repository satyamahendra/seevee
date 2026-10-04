import {
    ContentStateType,
    ContentType,
    FontStylesType,
    GeneralContentType,
    GeneralType,
    HeaderContentType,
    LinkType,
    MultipleInputType,
    SkillContentType,
    SummaryContentType,
} from "./type"

export const contentType: ContentType[] = ["header", "summary", "skill", "general", "project", "professional"]

export const linkInitial: LinkType = {id: "", icon: "", name: "", url: ""}
export const headerContentInitial: HeaderContentType = {
    id: "",
    type: "header",
    fullname: "",
    city: "",
    country: "",
    email: "",
    phone: "",
    links: [linkInitial],
}

export const summaryContentInitial: SummaryContentType = {
    id: "",
    type: "summary",
    text: "",
}

export const fontStyles: FontStylesType[] = ["default", "sans", "mono", "serif"]

export const skillInitial = {id: "", name: "", items: [""]}
export const skillContentInitial: SkillContentType = {id: "", type: "skill", skill: [skillInitial]}

export const generalInitial: GeneralType = {
    id: "",
    title: "",
    subtitle: "",
    description: "",
    bulletpoints: [""],
    tags: [],
    city: "",
    country: "",
    startDate: "",
    endDate: "",
    links: [],
}
export const generalContentInitial: GeneralContentType = {id: "", type: "general", title: "", general: [generalInitial]}

export const allContentInitials: ContentStateType[] = [headerContentInitial, summaryContentInitial, skillContentInitial, generalContentInitial]

export const ContentWithMultipleInput: MultipleInputType[] = ["skill", "general"]

export const blankResume: ContentStateType[] = [
    {
        id: "1741009899969983260100000550488981",
        city: "",
        type: "header",
        email: "",
        phone: "",
        country: "",
        fullname: "",
        links: [{icon: "", name: "", url: "", id: "2381903821093821903891203892183912"}],
    },
    {
        id: "1741009755966839257300000649395611",
        text: "",
        type: "summary",
    },
    {
        id: "17410099175191000810300000170718772",
        type: "skill",
        skill: [],
    },
]

export const emptyResume: ContentStateType[] = []

export const dummyResumeData: ContentStateType[] = [
    {
        id: "17540195188852834851399999154435613",
        type: "header",
        fullname: "John Doe",
        city: "San Francisco",
        country: "USA",
        email: "john.doe@techpro.com",
        phone: "+1 (415) 789-0123",
        links: [
            {
                id: "1",
                icon: "linkedin",
                name: "LinkedIn",
                url: "https://linkedin.com/in/johndoe",
            },
            {
                id: "2",
                icon: "github",
                name: "GitHub",
                url: "https://github.com/john-doe-dev",
            },
            {
                id: "3",
                icon: "portfolio",
                name: "Portfolio",
                url: "https://johndoe.dev",
            },
        ],
    },
    {
        id: "17540195203052836271500000916985162",
        type: "summary",
        text: "Full-Stack Software Engineer with 5+ years of experience building scalable web applications, optimizing performance, and leading small engineering teams. Expert in React, Next.js, and Node.js with strong cloud deployment skills (AWS, Docker). Proven track record in delivering high-impact SaaS products, improving system efficiency, and mentoring junior developers.",
    },
    {
        id: "17540195220062837972299999128467966",
        type: "general",
        title: "Professional Experience",
        general: [
            {
                id: "1",
                title: "Software Engineer",
                subtitle: "TechPro Solutions",
                description: "Developed and maintained enterprise-grade SaaS platforms",
                bulletpoints: [
                    "Built Next.js web apps serving 200k+ monthly active users with 99.9% uptime",
                    "Implemented credit-based billing system reducing transaction errors by 35%",
                    "Migrated legacy services to Dockerized microservices, cutting deployment time by 50%",
                    "Optimized API endpoints, reducing load time from 1.2s to 400ms",
                ],
                tags: ["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS"],
                city: "San Francisco",
                country: "USA",
                startDate: "2021-01-01",
                endDate: "2025-08-01",
                links: [
                    {
                        id: "1",
                        icon: "link",
                        name: "Company Site",
                        url: "https://techpro.example",
                    },
                ],
            },
            {
                id: "2",
                title: "Frontend Developer",
                subtitle: "BrightWave Technologies",
                description: "Delivered high-performance front-end solutions for analytics dashboards",
                bulletpoints: [
                    "Optimized React dashboards, reducing load times by 60%",
                    "Integrated GraphQL APIs to improve data-fetching efficiency",
                    "Developed reusable UI components, cutting development time by 25%",
                ],
                tags: ["React", "TypeScript", "GraphQL", "Redux", "Tailwind CSS"],
                city: "San Francisco",
                country: "USA",
                startDate: "2018-06-01",
                endDate: "2020-12-31",
                links: [],
            },
        ],
    },
    {
        id: "17540195430842859050399999660314572",
        type: "general",
        title: "Projects",
        general: [
            {
                id: "1",
                title: "AI Resume Builder",
                subtitle: "Open Source Project",
                description: "AI-powered resume builder that generates ATS-friendly resumes with real-time optimization tips",
                bulletpoints: [],
                tags: ["Next.js", "Node.js", "PostgreSQL", "Gemini API"],
                city: "",
                country: "",
                startDate: "2023-01-01",
                endDate: "2023-06-01",
                links: [
                    {
                        id: "1",
                        icon: "github",
                        name: "GitHub",
                        url: "https://github.com/john-doe-dev/ai-resume-builder",
                    },
                    {
                        id: "2",
                        icon: "external",
                        name: "Live Demo",
                        url: "https://airesume.johndoe.dev",
                    },
                ],
            },
            {
                id: "2",
                title: "YouTube Answer Extractor",
                subtitle: "SaaS Tool",
                description: "Summarizes and extracts key answers from long-form YouTube videos to save user time",
                bulletpoints: [],
                tags: ["React", "Node.js", "YouTube API"],
                city: "",
                country: "",
                startDate: "2022-07-01",
                endDate: "2022-12-01",
                links: [
                    {
                        id: "1",
                        icon: "github",
                        name: "GitHub",
                        url: "https://github.com/john-doe-dev/youtube-answer-extractor",
                    },
                ],
            },
        ],
    },
    {
        id: "27540195430842859050399999660314572",
        type: "general",
        title: "Education",
        general: [
            {
                id: "1",
                title: "Bachelor of Science in Computer Science",
                subtitle: "University of California, Berkeley",
                description: "Specialized in Software Engineering and Cloud Computing",
                bulletpoints: [],
                tags: [],
                city: "Berkeley",
                country: "USA",
                startDate: "2014-08-01",
                endDate: "2018-05-01",
                links: [],
            },
        ],
    },
    {
        id: "37540195430842859050399999660314572",
        type: "general",
        title: "Certifications",
        general: [
            {
                id: "1",
                title: "AWS Certified Solutions Architect – Associate",
                subtitle: "Amazon Web Services",
                description: "",
                bulletpoints: [],
                tags: [],
                city: "",
                country: "",
                startDate: "2023-05-01",
                endDate: "2026-05-01",
                links: [
                    {
                        id: "1",
                        icon: "link",
                        name: "Credential",
                        url: "https://aws.amazon.com/certification",
                    },
                ],
            },
            {
                id: "2",
                title: "Google Cloud Professional Developer",
                subtitle: "Google Cloud",
                description: "",
                bulletpoints: [],
                tags: [],
                city: "",
                country: "",
                startDate: "2022-06-01",
                endDate: "2025-06-01",
                links: [
                    {
                        id: "1",
                        icon: "link",
                        name: "Credential",
                        url: "https://cloud.google.com/certification",
                    },
                ],
            },
        ],
    },
    {
        id: "1754019674529299049489999911050839",
        type: "skill",
        skill: [
            {
                id: "1",
                name: "Frontend",
                items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "GraphQL", "Web Performance", "Accessibility"],
            },
            {
                id: "2",
                name: "Backend",
                items: ["Node.js", "Express", "PostgreSQL", "Microservices", "Serverless", "API Design"],
            },
            {
                id: "4",
                name: "Soft Skills",
                items: ["Agile Methodologies", "Team Leadership", "Mentoring", "Problem-Solving", "System Design"],
            },
        ],
    },
]
