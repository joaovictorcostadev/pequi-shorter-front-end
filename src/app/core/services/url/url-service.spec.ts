import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UrlService } from './url-service';
import { UrlListResponse, UrlResponse } from '../../models/url.model';
import { environment } from '../../../../environments/environment';

describe('UrlService', () => {
  let service: UrlService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UrlService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch user urls and cache userId if present', () => {
    const mockList: UrlListResponse = {
      code: 201,
      message: 'Urls found!',
      data: [
        {
          id: 1,
          name: 'test1234',
          external_url: 'https://example.com',
          user_id: 42,
          url: 'http://localhost:8000/r/test1234',
        },
      ],
    };

    let result: UrlListResponse | undefined;
    service.getUrls().subscribe((res) => {
      result = res;
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/url/get`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);

    req.flush(mockList);

    expect(result).toEqual(mockList);
    expect(service.getUserId()).toBe(42);
  });

  it('should send post request to create url with withCredentials', () => {
    service.setUserId(42);
    const mockCreated: UrlResponse = {
      code: 200,
      message: 'Url created!',
      data: {
        id: 2,
        name: 'custom',
        external_url: 'https://example.com/long',
        user_id: 42,
        url: 'http://localhost:8000/r/custom',
      },
    };

    let result: UrlResponse | undefined;
    service
      .createUrl({ external_url: 'https://example.com/long', name: 'custom' })
      .subscribe((res) => {
        result = res;
      });

    const req = httpTesting.expectOne(`${environment.apiUrl}/url/save`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual({
      external_url: 'https://example.com/long',
      name: 'custom',
      user_id: 42,
    });

    req.flush(mockCreated);
    expect(result).toEqual(mockCreated);
  });

  it('should send delete request for a specific url', () => {
    const mockDeleted: UrlResponse = {
      code: 200,
      message: 'Url deleted!',
      data: {
        id: 1,
        name: 'test1234',
        external_url: 'https://example.com',
        user_id: 42,
        url: 'http://localhost:8000/r/test1234',
      },
    };

    let result: UrlResponse | undefined;
    service.deleteUrl(1).subscribe((res) => {
      result = res;
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/url/delete/1`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBe(true);

    req.flush(mockDeleted);
    expect(result).toEqual(mockDeleted);
  });
});
