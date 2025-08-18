import { SubjectColorManager } from "@/components/subjects/subject-color-manager";

export default function Subjects() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6" data-testid="subjects-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subject Management</h1>
          <p className="text-gray-600">
            Customize colors for your subjects to better organize and identify your assignments.
          </p>
        </div>

        <SubjectColorManager />
      </div>
    </div>
  );
}