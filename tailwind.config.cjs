// Compile utility CSS locally: no executable styling CDN in the installed app.
module.exports = {
            darkMode: 'class',
            content: ['./index.html', './App.tsx', './components/**/*.{ts,tsx}'],
            theme: {
                extend: {
                    colors: {
                        brand: {
                            navy: '#0f172a',
                            navyLight: '#1e293b',
                            navyBorder: '#334155',
                            orange: '#f97316',
                            orangeDark: '#ea580c',
                            orangeLight: '#ffedd5',
                            bgLight: '#f8fafc',
                            cardLight: '#ffffff',
                            cardBorder: '#e2e8f0'
                        }
                    },
                    borderRadius: {
                        '2xl': '1rem',
                        '3xl': '1.5rem',
                        '4xl': '2rem'
                    }
                }
            }
        };
