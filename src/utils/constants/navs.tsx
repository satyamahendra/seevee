import {PiCube, PiHeart, PiKey, PiSealCheck, PiUsersThree} from "react-icons/pi"

export type Nav = {name: string; url: string; icon?: React.ReactNode; permissions?: string[]; subNavs?: Nav[]}

export const publicNavs: Nav[] = [
    {name: "Features", url: "#features"},
    {name: "Pricing", url: "#pricing"},
    {name: "FAQ", url: "#faq"},
]

export const privateNavs: Nav[] = [
    {name: "Resume", url: "/resume"},
    {name: "History", url: "/history"},
    {
        name: "Admin",
        url: "/admin",
        permissions: ["manage admin"],
        subNavs: [
            {
                name: "Products",
                url: "/admin/products",
                permissions: ["manage admin"],
                icon: <PiCube />,
            },
            {
                name: "Feedbacks",
                url: "/admin/feedbacks",
                permissions: ["manage admin"],
                icon: <PiHeart />,
            },
            {
                name: "Users",
                url: "/admin/users",
                permissions: ["manage admin"],
                icon: <PiUsersThree />,
            },
            {
                name: "Whitelist",
                url: "/admin/whitelist",
                permissions: ["manage admin"],
                icon: <PiSealCheck />,
            },
            {
                name: "Permissions",
                url: "/admin/permissions",
                permissions: ["manage admin"],
                icon: <PiKey />,
            },
        ],
    },
]
