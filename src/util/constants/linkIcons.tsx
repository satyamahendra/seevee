"use client"

import {FaBehanceSquare, FaDiscord, FaFacebook, FaGithub, FaInstagram, FaLinkedin, FaSpotify, FaSteam, FaTelegram, FaYoutube} from "react-icons/fa"
import {FaXTwitter} from "react-icons/fa6"

import React from "react"
import {PiGlobe, PiLink} from "react-icons/pi"

export type LinkIconName =
    | "linkedin"
    | "facebook"
    | "twitter"
    | "instagram"
    | "youtube"
    | "github"
    | "behance"
    | "telegram"
    | "steam"
    | "discord"
    | "spotify"
    | "globe"
    | ""

export type LinksIconType = {
    name: LinkIconName
    icon: React.ReactNode
}

// Provide all required keys
export const linkIcons: LinksIconType[] = [
    {name: "linkedin", icon: <FaLinkedin />},
    {name: "facebook", icon: <FaFacebook />},
    {name: "twitter", icon: <FaXTwitter />},
    {name: "instagram", icon: <FaInstagram />},
    {name: "youtube", icon: <FaYoutube />},
    {name: "github", icon: <FaGithub />},
    {name: "behance", icon: <FaBehanceSquare />},
    {name: "telegram", icon: <FaTelegram />},
    {name: "steam", icon: <FaSteam />},
    {name: "discord", icon: <FaDiscord />},
    {name: "spotify", icon: <FaSpotify />},
    {name: "globe", icon: <PiGlobe />},
    {name: "", icon: <PiLink />},
]
