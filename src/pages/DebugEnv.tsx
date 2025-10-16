import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DebugEnv = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">
            Environment Variable Debugger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              VITE_SUPABASE_URL
            </h2>
            <div className="mt-1 p-3 bg-gray-100 rounded-md font-mono text-sm break-all">
              {supabaseUrl ? (
                <span className="text-green-700">{supabaseUrl}</span>
              ) : (
                <span className="text-red-700">Status: Not Found</span>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              VITE_SUPABASE_ANON_KEY
            </h2>
            <div className="mt-1 p-3 bg-gray-100 rounded-md font-mono text-sm break-all">
              {supabaseAnonKey ? (
                <span className="text-green-700">{`${supabaseAnonKey.substring(
                  0,
                  10,
                )}... (truncated for security)`}</span>
              ) : (
                <span className="text-red-700">Status: Not Found</span>
              )}
            </div>
          </div>
          <div className="pt-4 border-t">
            <h3 className="font-semibold">Next Steps:</h3>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>
                If variables are "Not Found", the secrets are not being loaded
                into the application.
              </li>
              <li>
                This usually means the app server needs to be restarted after
                setting secrets.
              </li>
              <li>
                Try using the "Restart" or "Rebuild" command.
              </li>
              <li>
                If the problem persists, there may be an issue with the
                platform's secret management.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugEnv;