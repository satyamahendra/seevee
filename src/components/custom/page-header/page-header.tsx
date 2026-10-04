type PageHeaderProps = {
    title: React.ReactNode
    description: React.ReactNode
    icon?: React.ReactNode
    subComponent?: React.ReactNode
}

const PageHeader = ({title, description, icon, subComponent}: PageHeaderProps) => {
    return (
        <header className="flex gap-2 items-center flex-col">
            <div className="bg-muted border text-2xl aspect-square p-2 w-12 h-12 flex items-center justify-center rounded-md text-secondary-foreground">{icon ? icon : "?"}</div>
            <div className="flex flex-col text-center">
                <h2 className="font-semibold text-xl">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="w-full">{subComponent}</div>
        </header>
    )
}

export default PageHeader
