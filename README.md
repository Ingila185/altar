# Grid Generator

A modern Angular application that generates customizable alphabet grids with bias character support. This application allows users to create and visualize grids of random lowercase letters with the option to bias the generation towards specific characters.

## Features

- Generate 10x10 grids of random lowercase letters
- Support for bias character selection
- Real-time grid generation
- Responsive design
- Input validation for bias characters
- Error handling with typed exceptions
- Comprehensive unit test coverage

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (v18.2.7 or higher)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd grid-generator
```

2. Install dependencies:

```bash
npm install
```

## Development

Run the development server:

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Testing

### Unit Tests

Run the unit tests:

```bash
ng test
```

To generate a code coverage report:

```bash
ng test --code-coverage
```

The coverage report will be generated in the `coverage` directory. Currently it is approx. 97%.

### End-to-End Tests

Run the end-to-end tests:

```bash
ng e2e
```

## Project Structure

```
grid-generator/
├── src/
│   ├── app/
│   │   ├── grid/                 # Grid component and related files
│   │   │   ├── grid.component.ts
│   │   │   ├── grid.component.html
│   │   │   └── grid.component.css
│   │   │
│   │   │   ├── models/              # Data models and interfaces
│   │   │   └── services/            # Application services
│   │   └── constants/           # Application constants
│   │
│   ├── assets/                  # Static assets
│   └── environments/            # Environment configurations
│
├── tests/                       # Test files
└── angular.json                 # Angular configuration
```

## API Integration

The application integrates with a backend API that provides grid generation functionality. The API endpoint is configured in the environment files:

- Development: `http://localhost:3000/grid`
- Production: Configure in `environment.prod.ts`

## Error Handling

The application implements a robust error handling system with typed exceptions:

- `GridValidationException`: For input validation errors
- `GridApiException`: For API-related errors

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Angular](https://angular.io/)
- Testing powered by [Karma](https://karma-runner.github.io/) and [Jasmine](https://jasmine.github.io/)
- Styling with modern CSS
