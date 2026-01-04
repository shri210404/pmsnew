import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { authInterceptor } from '@shared/interceptors/auth.interceptor';
import { errorInterceptor } from '@shared/interceptors/error.interceptor';
import { credentialsInterceptor } from '@shared/interceptors/credentials.interceptor';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
    // Provide default options for MatDialog
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        hasBackdrop: true,
        disableClose: false,
        width: '80%',
        maxWidth: '100vw',
        maxHeight: '100vh'
      }
    },
    // Order matters: CredentialsInterceptor first (to add withCredentials), 
    // then AuthInterceptor (to add token), then ErrorInterceptor (to handle errors)
    provideHttpClient(
      withInterceptors([credentialsInterceptor, authInterceptor, errorInterceptor])
    )
  ]
};
