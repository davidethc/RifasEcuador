'use client';

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

/**
 * Componente Stepper - Indicador visual de progreso
 * Muestra los pasos del proceso de compra
 */
export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full py-6 px-4 md:px-24 lg:px-48">
      <div className="max-w-4xl mx-auto">
        {/* Stepper Desktop */}
        <div className="hidden md:flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                    currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id
                      ? 'bg-blue-600 dark:bg-amber-400 text-white dark:text-gray-900 ring-4 ring-blue-200 dark:ring-amber-200'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {currentStep > step.id ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-semibold font-[var(--font-comfortaa)] ${
                      currentStep >= step.id
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-[var(--font-dm-sans)]">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Line connector */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-4 relative">
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div
                    className={`absolute inset-0 rounded transition-all duration-500 ${
                      currentStep > step.id
                        ? 'bg-green-500 w-full'
                        : currentStep === step.id
                        ? 'bg-blue-600 dark:bg-amber-400 w-1/2'
                        : 'w-0'
                    }`}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stepper Mobile */}
        <div className="md:hidden">
          <div className="flex items-center justify-center gap-2 mb-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`h-2 flex-1 rounded-full transition-all ${
                  currentStep > step.id
                    ? 'bg-green-500'
                    : currentStep === step.id
                    ? 'bg-blue-600 dark:bg-amber-400'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              ></div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-[var(--font-dm-sans)]">
              Paso {currentStep} de {steps.length}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 font-[var(--font-comfortaa)]">
              {steps.find((s) => s.id === currentStep)?.title}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
