package controllers

import (
	"errors"
	"fmt"

	"github.com/go-playground/validator/v10"
)

// Ubah error dari validator jadi list {field, message} yang lebih manusiawi
func validationErrorsToResponse(err error) []map[string]string {
	var ve validator.ValidationErrors
	var result []map[string]string

	if errors.As(err, &ve) {
		for _, fe := range ve {
			field := fe.Field()
			msg := ""

			switch fe.Tag() {
			case "required":
				msg = fmt.Sprintf("%s wajib diisi", field)
			case "email":
				msg = "Format email tidak valid"
			case "min":
				msg = fmt.Sprintf("%s minimal %s karakter", field, fe.Param())
			case "gt":
				msg = fmt.Sprintf("%s harus lebih besar dari %s", field, fe.Param())
			case "len":
				msg = fmt.Sprintf("%s harus %s karakter", field, fe.Param())
			case "oneof":
				msg = fmt.Sprintf("%s hanya boleh salah satu dari: %s", field, fe.Param())
			case "numeric":
				msg = fmt.Sprintf("%s harus berupa angka", field)
			default:
				msg = fe.Error()
			}

			result = append(result, map[string]string{
				"field":   field,
				"message": msg,
			})
		}
	} else {
		result = append(result, map[string]string{
			"field":   "-",
			"message": err.Error(),
		})
	}

	return result
}
