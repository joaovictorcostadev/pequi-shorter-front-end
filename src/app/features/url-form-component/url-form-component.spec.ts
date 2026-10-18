import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { FormsModule, NgForm } from '@angular/forms';
import { UrlFormComponent } from './url-form-component';
import { UrlService } from '../../core/services/url/url-service';

describe('UrlFormComponent', () => {
  let component: UrlFormComponent;
  let fixture: ComponentFixture<UrlFormComponent>;
  let urlServiceMock: {
    createUrl: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    urlServiceMock = {
      createUrl: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [UrlFormComponent, FormsModule],
      providers: [
        { provide: UrlService, useValue: urlServiceMock },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UrlFormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit when externalUrl is empty', () => {
    const fakeForm = { invalid: true } as NgForm;
    component.onSubmit(fakeForm);

    expect(urlServiceMock.createUrl).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('URL externa válida');
  });

  it('should format URL with https://, call service and navigate to /links on success', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    urlServiceMock.createUrl.mockReturnValue(
      of({
        code: 200,
        message: 'Url created!',
        data: {
          id: 1,
          name: 'minha-url',
          external_url: 'https://meusite.com',
          user_id: 1,
          url: 'http://localhost:8000/r/minha-url',
        },
      })
    );

    component.externalUrl = 'meusite.com';
    component.customName = 'minha-url';

    const fakeForm = { invalid: false } as NgForm;
    component.onSubmit(fakeForm);

    expect(urlServiceMock.createUrl).toHaveBeenCalledWith({
      external_url: 'https://meusite.com',
      name: 'minha-url',
    });
    expect(component.isLoading).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/links']);
  });

  it('should alert and show errorMessage when createUrl fails', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    urlServiceMock.createUrl.mockReturnValue(
      throwError(() => ({
        error: { message: 'Url existed!' },
      }))
    );

    component.externalUrl = 'https://google.com';
    const fakeForm = { invalid: false } as NgForm;
    component.onSubmit(fakeForm);

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('Url existed!');
    expect(alertSpy).toHaveBeenCalledWith('Url existed!');
  });

  it('should navigate to /links on cancel', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onCancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/links']);
  });
});
