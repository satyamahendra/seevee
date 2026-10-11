// utils/copyToClipboard.js
export const copyToClipboard = async (text: string) => {
    try {
        // Modern approach
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text)
            return true
        } else {
            // Fallback for older browsers
            const textArea = document.createElement("textarea")
            textArea.value = text
            textArea.style.position = "fixed"
            textArea.style.top = "0"
            textArea.style.left = "0"
            textArea.style.opacity = "0"
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()

            const success = document.execCommand("copy")
            document.body.removeChild(textArea)
            return success
        }
    } catch (err) {
        console.error("Failed to copy: ", err)
        return false
    }
}
