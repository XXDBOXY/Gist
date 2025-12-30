package handler

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v4"

	"gist/backend/internal/service"
)

type errorResponse struct {
	Error string `json:"error"`
}

type importStartedResponse struct {
	Status string `json:"status"`
}

type importCancelledResponse struct {
	Cancelled bool `json:"cancelled"`
}

type importIdleResponse struct {
	Status string `json:"status"`
}

func writeServiceError(c echo.Context, err error) error {
	switch {
	case errors.Is(err, service.ErrInvalid):
		return c.JSON(http.StatusBadRequest, errorResponse{Error: "invalid request"})
	case errors.Is(err, service.ErrNotFound):
		return c.JSON(http.StatusNotFound, errorResponse{Error: "resource not found"})
	case errors.Is(err, service.ErrConflict):
		return c.JSON(http.StatusConflict, errorResponse{Error: "conflict"})
	case errors.Is(err, service.ErrFeedFetch):
		return c.JSON(http.StatusBadGateway, errorResponse{Error: "feed fetch failed"})
	default:
		c.Logger().Error(err)
		return c.JSON(http.StatusInternalServerError, errorResponse{Error: "internal error"})
	}
}

// Error returns a JSON error response with the given status and message
func Error(c echo.Context, status int, message string) error {
	return c.JSON(status, errorResponse{Error: message})
}
