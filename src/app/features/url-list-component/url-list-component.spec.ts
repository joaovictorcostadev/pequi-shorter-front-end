import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { UrlListComponent } from './url-list-component';
import { UrlService } from '../../core/services/url/url-service';
import { UrlDtoResponse, UrlListResponse } from '../../core/models/url.model';

describe('UrlListComponent', () => {
  let component: UrlListComponent;
  let fixture: ComponentFixture<UrlListComponent>;
  let urlServiceMock: {
    getUrls: ReturnType<typeof vi.fn>;
    deleteUrl: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  const mockUrls: UrlDtoResponse[] = [
    {
      id: 1,
      name: 'google-link',
      external_url: 'https://google.com',
      user_id: 10,
      url: 'http://localhost:8000/r/google-link',
    },
    {
      id: 2,
      name: 'github-link',
      external_url: 'https://github.com',
      user_id: 10,
      url: 'http://localhost:8000/r/github-link',
    },
  ];

  beforeEach(async () => {
    urlServiceMock = {
      getUrls: vi.fn().mockReturnValue(of({ code: 201, message: 'Urls found!', data: mockUrls })),
      deleteUrl: vi.fn().mockReturnValue(of({ code: 200, message: 'Deleted!', data: mockUrls[0] })),
    };

    await TestBed.configureTestingModule({
      imports: [UrlListComponent],
      providers: [
        { provide: UrlService, useValue: urlServiceMock },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UrlListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load and display urls on init', () => {
    fixture.detectChanges();
    expect(urlServiceMock.getUrls).toHaveBeenCalled();
    expect(component.urls.length).toBe(2);
    expect(component.isLoading).toBe(false);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('google-link');
    expect(compiled.textContent).toContain('github-link');
  });

  it('should display empty state when user has no urls', () => {
    urlServiceMock.getUrls.mockReturnValue(of({ code: 201, message: 'Urls found!', data: [] }));
    fixture.detectChanges();

    expect(component.urls.length).toBe(0);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nenhum link encontrado');
  });

  it('should show error message when getUrls fails', () => {
    urlServiceMock.getUrls.mockReturnValue(
      throwError(() => ({ error: { message: 'Erro no servidor' } }))
    );
    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('Erro no servidor');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Erro no servidor');
  });

  it('should navigate to /links/create when clicking create button', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.navigateToCreate();
    expect(navigateSpy).toHaveBeenCalledWith(['/links/create']);
  });

  it('should copy link to clipboard', async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextSpy },
    });

    component.copyToClipboard(mockUrls[0]);
    expect(writeTextSpy).toHaveBeenCalledWith(mockUrls[0].url);
  });

  it('should delete url after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fixture.detectChanges();

    expect(component.urls.length).toBe(2);
    component.onDelete(mockUrls[0]);

    expect(urlServiceMock.deleteUrl).toHaveBeenCalledWith(1);
    expect(component.urls.length).toBe(1);
    expect(component.urls[0].id).toBe(2);
  });
});
