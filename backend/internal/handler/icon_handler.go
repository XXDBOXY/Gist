package handler

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"

	"gist/backend/internal/service"
)

type IconHandler struct {
	iconService service.IconService
}

func NewIconHandler(iconService service.IconService) *IconHandler {
	return &IconHandler{
		iconService: iconService,
	}
}

func (h *IconHandler) RegisterRoutes(e *echo.Echo) {
	e.GET("/icons/:filename", h.GetIcon)
}

// GetIcon serves icon files with automatic cache recovery
func (h *IconHandler) GetIcon(c echo.Context) error {
	filename := c.Param("filename")
	if filename == "" {
		return c.NoContent(http.StatusNotFound)
	}

	// Sanitize filename to prevent path traversal
	filename = filepath.Base(filename)
	fullPath := h.iconService.GetIconPath(filename)

	// Check if file exists
	if _, err := os.Stat(fullPath); err == nil {
		return c.File(fullPath)
	}

	// File missing, try to recover
	// Extract feedID from filename (e.g., "123.png" -> 123)
	feedID, err := extractFeedIDFromFilename(filename)
	if err != nil {
		return c.NoContent(http.StatusNotFound)
	}

	// Try to recover icon via service (fetches feed's siteURL internally)
	if err := h.iconService.EnsureIconByFeedID(c.Request().Context(), feedID, filename); err != nil {
		return c.NoContent(http.StatusNotFound)
	}

	// Check if file exists now
	if _, err := os.Stat(fullPath); err != nil {
		return c.NoContent(http.StatusNotFound)
	}

	return c.File(fullPath)
}

func extractFeedIDFromFilename(filename string) (int64, error) {
	// Remove extension
	name := strings.TrimSuffix(filename, filepath.Ext(filename))
	if name == "" {
		return 0, fmt.Errorf("invalid filename")
	}

	return strconv.ParseInt(name, 10, 64)
}
