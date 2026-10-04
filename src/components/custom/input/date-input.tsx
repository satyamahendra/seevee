import {format, isValid} from "date-fns"
import {useRef} from "react"

type DateInputProps = {
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>, ...args: unknown[]) => void
    dateFormat?: string
    name?: string
}

export default function DateInput({value, onChange, dateFormat = "MMM, yyyy", name = "date"}: DateInputProps) {
    const inputRef = useRef<HTMLInputElement>(null)

    const handleDivClick = () => {
        inputRef.current?.showPicker()
    }

    const formattedValue = value && isValid(new Date(value)) ? format(new Date(value), dateFormat) : "Present"

    return (
        <div onClick={handleDivClick} style={{cursor: "pointer"}}>
            <div className="text-muted-foreground">{formattedValue}</div>
            <input
                ref={inputRef}
                type="date"
                name={name}
                value={value}
                onChange={onChange}
                style={{
                    opacity: 0,
                    position: "absolute",
                    pointerEvents: "none",
                }}
            />
        </div>
    )
}
