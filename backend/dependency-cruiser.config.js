module.exports = {
  forbidden: [
    // Domain layer should not depend on any other layers
    {
      name: 'no-domain-to-infrastructure',
      comment: 'Domain layer should not depend on Infrastructure layer',
      severity: 'error',
      from: {
        path: '^src/domain'
      },
      to: {
        path: '^src/infrastructure'
      }
    },
    {
      name: 'no-domain-to-api',
      comment: 'Domain layer should not depend on API layer',
      severity: 'error',
      from: {
        path: '^src/domain'
      },
      to: {
        path: '^src/api'
      }
    },
    {
      name: 'no-domain-to-application',
      comment: 'Domain layer should not depend on Application layer',
      severity: 'error',
      from: {
        path: '^src/domain'
      },
      to: {
        path: '^src/application'
      }
    },
    
    // Application layer should not depend on API layer
    {
      name: 'no-application-to-api',
      comment: 'Application layer should not depend on API layer',
      severity: 'error',
      from: {
        path: '^src/application'
      },
      to: {
        path: '^src/api'
      }
    },
    
    // Application layer should not depend on Infrastructure layer (only through interfaces)
    {
      name: 'no-application-to-infrastructure',
      comment: 'Application layer should only depend on Infrastructure through interfaces',
      severity: 'error',
      from: {
        path: '^src/application'
      },
      to: {
        path: '^src/infrastructure',
        pathNot: '^src/application/interfaces'
      }
    },

    // Infrastructure should not depend on API layer
    {
      name: 'no-infrastructure-to-api',
      comment: 'Infrastructure layer should not depend on API layer',
      severity: 'error',
      from: {
        path: '^src/infrastructure'
      },
      to: {
        path: '^src/api'
      }
    },

    // No circular dependencies
    {
      name: 'no-circular',
      comment: 'No circular dependencies allowed',
      severity: 'error',
      from: {},
      to: {
        circular: true
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules'
    },
    includeOnly: {
      path: '^src'
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json'
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default']
    },
    reporterOptions: {
      text: {
        highlightFocused: true
      }
    }
  }
};