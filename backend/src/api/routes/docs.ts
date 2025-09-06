import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from '../../../build/swagger.json';

const router = Router();

// Serve Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customSiteTitle: "Atilio API Documentation",
  customfavIcon: '/favicon.ico',
  customCssUrl: undefined,
  swaggerOptions: {
    persistAuthorization: true,
  }
}));

// Serve raw JSON
router.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

export default router;