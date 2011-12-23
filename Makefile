TEST_FILES=tests/test_fd.js

test:
	whiskey --tests "${TEST_FILES}" --sequential 

test-fast:
	whiskey --tests "${TEST_FILES}" --failfast

tap:
	whiskey --tests "${TEST_FILES}" --test-reporter tap

coverage:
	whiskey --tests "${TEST_FILES}" --coverage --coverage-reporter html \
          --coverage-dir coverage_html

cov:
	make coverage

leaks:
	whiskey --tests "${TEST_FILES}" --scope-leaks

.PHONY: test tap coverage cov leaks