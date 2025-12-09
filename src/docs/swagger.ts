import swaggerJsdoc from "swagger-jsdoc"

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Node Express TypeScript API",
			version: "1.0.0",
			description:
				"A Node.js TypeScript Express API template with best practices"
		},
		servers: [
			{
				url: "http://localhost:{port}",
				description: "Development server",
				variables: {
					port: {
						default: "3000"
					}
				}
			}
		]
	},
	apis: ["./src/routes/**/*.ts"]
}

export const swaggerSpec = swaggerJsdoc(options)
