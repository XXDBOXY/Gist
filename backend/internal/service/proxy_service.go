package service

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

const proxyTimeout = 15 * time.Second

var (
	ErrInvalidURL      = fmt.Errorf("invalid URL")
	ErrInvalidProtocol = fmt.Errorf("invalid protocol")
	ErrRequestTimeout  = fmt.Errorf("request timeout")
	ErrFetchFailed     = fmt.Errorf("fetch failed")
)

type ProxyResult struct {
	Data        []byte
	ContentType string
}

type ProxyService interface {
	FetchImage(ctx context.Context, imageURL string) (*ProxyResult, error)
}

type proxyService struct {
	httpClient *http.Client
}

func NewProxyService() ProxyService {
	return &proxyService{
		httpClient: &http.Client{
			Timeout: proxyTimeout,
		},
	}
}

func (s *proxyService) FetchImage(ctx context.Context, imageURL string) (*ProxyResult, error) {
	// Validate URL
	parsedURL, err := url.Parse(imageURL)
	if err != nil {
		return nil, ErrInvalidURL
	}

	// Only allow http/https
	if parsedURL.Scheme != "http" && parsedURL.Scheme != "https" {
		return nil, ErrInvalidProtocol
	}

	// Create request with context
	ctx, cancel := context.WithTimeout(ctx, proxyTimeout)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, imageURL, nil)
	if err != nil {
		return nil, ErrFetchFailed
	}

	// Set headers to mimic browser
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "image/*,*/*;q=0.8")
	req.Header.Set("Referer", parsedURL.Scheme+"://"+parsedURL.Host+"/")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		if ctx.Err() == context.DeadlineExceeded {
			return nil, ErrRequestTimeout
		}
		return nil, ErrFetchFailed
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("%w: %d", ErrFetchFailed, resp.StatusCode)
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, ErrFetchFailed
	}

	contentType := resp.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	return &ProxyResult{
		Data:        data,
		ContentType: contentType,
	}, nil
}
