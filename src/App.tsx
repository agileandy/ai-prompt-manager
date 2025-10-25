import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkle } from "@phosphor-icons/react"

function App() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Sparkle className="text-primary" size={48} />
                    </div>
                    <CardTitle className="text-3xl">Welcome to Spark</CardTitle>
                    <CardDescription>
                        Your app is now running. Ready to build something amazing?
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Button>Get Started</Button>
                </CardContent>
            </Card>
        </div>
    )
}

export default App